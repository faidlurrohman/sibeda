import React, { useState } from "react";
import { ImportOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Modal, Space, Upload } from "antd";
import { swal } from "../../helpers/swal";
import { isEmpty, lower } from "../../helpers/typo";
import { ACCOUNT_CODE, PAGINATION } from "../../helpers/constants";
import { addPlan, findPlan } from "../../services/plan";
import _ from "lodash";
import ProgressIndicator from "./ProgressIndicator";
import ImageButton from "./ImageButton";

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
  const [uploadProgress, setUploadProgress] = useState(0);

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
        // check sheets
        if (workbook.worksheets.length > 1) {
          setConfirmLoading(false);
          swal(
            "Pastikan Sheets dari file XLS/XLSX yang diunggah tidak lebih dari satu",
            "warning"
          );
        } else {
          const ws = workbook.getWorksheet();

          // check read file, make sure file on default sheet target
          if (!isEmpty(ws)) {
            if (type === "in" || type === "cost") {
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

                    if (
                      _res[_iCode] &&
                      _res[_iCode].slice(0, 1) === ACCOUNT_CODE[type]
                    ) {
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

                    if (
                      _res[_iCode] &&
                      _res[_iCode].slice(0, 1) === ACCOUNT_CODE[type]
                    ) {
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
              let _grouping = _.groupBy(
                _prep,
                "account_object_detail_sub_code"
              );
              let _data = _.chain(_grouping)
                .map((_budget) => ({
                  budget_year: _budget[0].budget_year,
                  account_object_detail_sub_code:
                    _budget[0].account_object_detail_sub_code,
                  amount: _.sumBy(_budget, (b) => b?.amount),
                  filters: _budget[0].filters,
                  duplicate: _budget.length,
                }))
                .value();

              doInsertBudget(_data, 0, 0, 100 / _data.length);
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

  const doInsertBudget = (data, mainIndex = 0, count = 0, treshold = 0) => {
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
                // progress
                setUploadProgress((p) => (p += treshold));

                // do next query
                doInsertBudget(data, mainIndex + 1, count + 1, treshold);
              } else {
                // show error and stop loading
                setConfirmLoading(false);
              }
            });
          } else {
            // progress
            setUploadProgress((p) => (p += treshold));

            // do next query
            doInsertBudget(data, mainIndex + 1, count, treshold);
          }
        } else {
          // show error and stop loading
          setConfirmLoading(false);
        }
      });
    } else {
      setUploadProgress(100);

      setTimeout(() => {
        handleImportModal(false);
        swal(`Data berhasil ditambahkan, total : ${count}`, "success");
        setUploadProgress(0);

        if (!isEmpty(onFinish)) onFinish();
      }, 500);
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
          {confirmLoading && (
            <ProgressIndicator percent={Math.round(uploadProgress)} />
          )}
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <ImageButton label="Contoh File Upload" src={type} />
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
