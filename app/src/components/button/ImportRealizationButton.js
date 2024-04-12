import React, { useState } from "react";
import { ImportOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Modal, Space, Upload } from "antd";
import { swal } from "../../helpers/swal";
import { isEmpty, lower } from "../../helpers/typo";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { addReal, findReal } from "../../services/real";
import { convertDate, dbDate } from "../../helpers/date";

const ExcelJS = require("exceljs");

export default function ImportRealizationButton({
  title = "Upload",
  type = "",
  year = 0,
  city = 0,
  onFinish,
}) {
  // import budget modal
  const [importRealizationModal, setImportRealizationModal] = useState(false);

  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleImportModal = (show) => {
    if (type !== "") {
      if (["in", "out", "cost"].includes(type)) {
        setImportRealizationModal(show);
      }

      if (show) {
        form.resetFields();
        setConfirmLoading(false);
      }
    }
  };

  const onFinishImport = (values) => {
    if (values && !!values?.import_data.length && type !== "") {
      setConfirmLoading(true);

      if (["in", "out", "cost"].includes(type)) {
        readExcel(values);
      } else {
        setConfirmLoading(false);
      }
    }
  };

  const readExcel = (values) => {
    const workbook = new ExcelJS.Workbook();
    const _prep = [];

    const _excel = values?.import_data[0];
    const _date = dbDate(values?.date);

    workbook.xlsx
      .load(_excel?.originFileObj)
      .then(() => {
        const ws = workbook.getWorksheet();

        // check read file, make sure file on default sheet target
        if (!isEmpty(ws)) {
          const _rows = ws._rows;
          const _header = _rows[0].values;

          const _iCode = _header.findIndex(
            (i) => lower(i) === "nomor rekening"
          );
          const _iName = _header.findIndex((i) => lower(i) === "nama rekening");
          const _iPagu = _header.findIndex((i) => lower(i) === "pagu");
          const _iRealization = _header.findIndex(
            (i) => lower(i) === "realisasi"
          );

          if ([_iCode, _iName, _iPagu, _iRealization].includes(-1)) {
            setConfirmLoading(false);
            swal(
              "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
              "warning"
            );
          } else {
            _rows.map((data, index) => {
              const _res = data?.values;
              if (index > 0) {
                // make filter
                const _filters = {
                  filters: {
                    dt: [_date],
                    account_object_detail_sub_code: [_res[_iCode]],
                  },
                  pagination: { ...PAGINATION?.pagination, pageSize: 0 },
                };

                if (_res[_iCode]) {
                  _prep.push({
                    code: _res[_iCode],
                    name: _res[_iName],
                    budget_amount: _res[_iPagu],
                    realization_amount: _res[_iRealization],
                    date: _date,
                    filters: _filters,
                  });
                }
              }
            });

            // preparation for inserting data
            if (!!_prep.length) {
              // recursive function for a while
              doInsertRealization(_prep);
            } else {
              setConfirmLoading(false);
              swal(
                "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
                "warning"
              );
            }
          }
        } else {
          setConfirmLoading(false);
          swal(
            "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
            "warning"
          );
        }
      })
      .catch(() => {
        setConfirmLoading(false);
        swal(
          "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
          "warning"
        );
      });
  };

  const doInsertRealization = (data, mainIndex = 0, count = 0) => {
    const _target = data[mainIndex];

    if (!isEmpty(_target)) {
      findReal(type, _target?.filters).then((found) => {
        // set response
        const _rlz = found?.data[0];

        if (found?.code === 200) {
          // continue insert or update
          if (!isEmpty(_rlz)) {
            // make payload
            const _payload = {
              mode: "C",
              city_id: city,
              account_object_detail_sub_id: _rlz?.account_object_detail_sub_id,
              amount: _target?.realization_amount,
              date: _target?.date,
            };

            if (_rlz?.id) {
              _payload["id"] = _rlz?.id;
              _payload["mode"] = "U";
            }

            addReal(_payload).then((response) => {
              if (response?.code === 200) {
                // do next query
                doInsertRealization(data, mainIndex + 1, count + 1);
              } else {
                // show error and stop loading
                setConfirmLoading(false);
              }
            });
          } else {
            // do next query
            doInsertRealization(data, mainIndex + 1, count);
          }
        } else {
          // show error and stop loading
          setConfirmLoading(false);
        }
      });
    } else {
      handleImportModal(false);
      swal(`Data berhasil ditambahkan, total : ${count}`, "success");

      if (!isEmpty(onFinish)) onFinish();
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<ImportOutlined />}
        onClick={() => handleImportModal(true)}
      >
        {title}
      </Button>

      <Modal
        style={{ margin: 10 }}
        centered
        open={importRealizationModal}
        title={`${title} Data`}
        onCancel={() => (confirmLoading ? null : handleImportModal(false))}
        closable={false}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          labelAlign="left"
          onFinish={onFinishImport}
          autoComplete="off"
          initialValues={{
            date: convertDate(`${year}`),
            import_data: [],
          }}
        >
          <Divider />
          <Form.Item
            label="Tanggal"
            name="date"
            rules={[
              {
                required: true,
                message: "Tanggal tidak boleh kosong!",
              },
            ]}
          >
            <DatePicker
              className="w-full"
              format={DATE_FORMAT_VIEW}
              allowClear={false}
              disabled={confirmLoading}
              disabledDate={(curr) => {
                const useYear =
                  curr && convertDate(curr, "YYYY") !== String(year);

                return useYear;
              }}
            />
          </Form.Item>
          <Form.Item
            label="File"
            name="import_data"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }

              return e?.fileList;
            }}
            rules={[
              {
                required: true,
                message: "File tidak boleh kosong!",
              },
              () => ({
                validator(_, value) {
                  if (value && !!value.length && !value[0]?.url) {
                    const isXlsx = [
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      "application/vnd.ms-excel",
                    ].includes(value[0]?.type);

                    if (!isXlsx)
                      return Promise.reject(
                        "You can only upload XLS/XLSX file!"
                      );
                  }

                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Upload
              accept="xlsx"
              maxCount={1}
              disabled={confirmLoading}
              beforeUpload={() => {
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>{title}</Button>
            </Upload>
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button
                disabled={confirmLoading}
                onClick={() => handleImportModal(false)}
              >
                Kembali
              </Button>
              <Button loading={confirmLoading} htmlType="submit" type="primary">
                Simpan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
