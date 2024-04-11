import React, { useState } from "react";
import { ImportOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Modal, Space, Upload } from "antd";
import { swal } from "../../helpers/swal";
import { isEmpty, lower } from "../../helpers/typo";
import { PAGINATION } from "../../helpers/constants";
import { addPlan, findPlan } from "../../services/plan";

const ExcelJS = require("exceljs");

export default function ImportBudgetButton({
  title = "Upload",
  type = "",
  year = 0,
  city = 0,
  onFinish,
}) {
  // import budget modal
  const [importBudgetModal, setImportBudgetModal] = useState(false);

  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleImportModal = (show) => {
    if (type !== "") {
      if (["in", "out", "cost"].includes(type)) {
        setImportBudgetModal(show);
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
        readExcel(values?.import_data[0]);
      } else {
        setConfirmLoading(false);
      }
    }
  };

  const readExcel = (values) => {
    const workbook = new ExcelJS.Workbook();
    const _prep = [];

    workbook.xlsx
      .load(values?.originFileObj)
      .then(() => {
        const ws = workbook.getWorksheet();

        // check read file, make sure file on default sheet target
        if (!isEmpty(ws)) {
          if (type === "in" || type === "cost") {
            // PENDAPATAN
            // must be have TAHUN, KODE AKUN, PAGU
            const _rows = ws._rows;
            const _header = _rows[0].values;
            const _iYear = _header.findIndex((i) => lower(i) === "tahun");
            const _iCode = _header.findIndex((i) => lower(i) === "kode akun");
            const _iAmount = _header.findIndex((i) => lower(i) === "pagu");

            if ([_iYear, _iCode, _iAmount].includes(-1)) {
              setConfirmLoading(false);
              swal(
                "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
                "warning"
              );
            } else {
              _rows.map((data, index) => {
                const _res = data?.values;

                if (index > 0 && String(_res[_iYear]) === String(year)) {
                  // make filter
                  const _filters = {
                    filters: {
                      account_object_detail_sub_code: [_res[_iCode]],
                    },
                    pagination: { ...PAGINATION?.pagination, pageSize: 0 },
                  };

                  if (_res[_iCode]) {
                    _prep.push({
                      budget_year: _res[_iYear],
                      account_object_detail_sub_code: _res[_iCode],
                      amount: _res[_iAmount],
                      filters: _filters,
                    });
                  }
                }
              });
            }
          } else if (type === "out") {
            // BELANJA
            // must be have TAHUN, KODE REKENING, PAGU
            const _rows = ws._rows;
            const _header = _rows[0].values;
            const _iYear = _header.findIndex((i) => lower(i) === "tahun");
            const _iCode = _header.findIndex(
              (i) => lower(i) === "kode rekening"
            );
            const _iAmount = _header.findIndex((i) => lower(i) === "pagu");

            if ([_iYear, _iCode, _iAmount].includes(-1)) {
              setConfirmLoading(false);
              swal(
                "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
                "warning"
              );
            } else {
              _rows.map((data, index) => {
                const _res = data?.values;

                if (index > 0 && String(_res[_iYear]) === String(year)) {
                  // make filter
                  const _filters = {
                    filters: {
                      account_object_detail_sub_code: [_res[_iCode]],
                    },
                    pagination: { ...PAGINATION?.pagination, pageSize: 0 },
                  };

                  if (_res[_iCode]) {
                    _prep.push({
                      budget_year: _res[_iYear],
                      account_object_detail_sub_code: _res[_iCode],
                      amount: _res[_iAmount],
                      filters: _filters,
                    });
                  }
                }
              });
            }
          }

          // preparation for inserting data
          if (!!_prep.length) {
            // recursive function for a while
            doInsertBudget(_prep);
          } else {
            setConfirmLoading(false);
            swal(
              "Tidak ada data yang ditemukan, cek format isi file XLS/XLSX yang diunggah",
              "warning"
            );
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

  const doInsertBudget = (data, mainIndex = 0, count = 0) => {
    const _target = data[mainIndex];

    if (!isEmpty(_target)) {
      findPlan(type, _target?.filters).then((found) => {
        // set response
        const _bgt = found?.data[0];

        if (found?.code === 200) {
          // continue insert or update
          if (!isEmpty(_bgt)) {
            // make payload
            const _payload = {
              mode: "C",
              city_id: city,
              account_object_detail_sub_id: _bgt?.account_object_detail_sub_id,
              amount: _target?.amount,
            };

            if (_bgt?.id) {
              _payload["id"] = _bgt?.id;
              _payload["mode"] = "U";
            }

            addPlan(_payload).then((response) => {
              if (response?.code === 200) {
                // do next query
                doInsertBudget(data, mainIndex + 1, count + 1);
              } else {
                // show error and stop loading
                setConfirmLoading(false);
              }
            });
          } else {
            // do next query
            doInsertBudget(data, mainIndex + 1, count);
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
        open={importBudgetModal}
        title={`${title} Data`}
        onCancel={() => (confirmLoading ? null : handleImportModal(false))}
        closable={false}
        footer={null}
      >
        <Form
          form={form}
          labelCol={{ span: 4 }}
          labelAlign="left"
          onFinish={onFinishImport}
          autoComplete="off"
          initialValues={{
            import_data: [],
          }}
        >
          <Divider />
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