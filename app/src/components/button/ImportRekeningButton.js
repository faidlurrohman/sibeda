import React, { useState } from "react";
import { ImportOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Form, Modal, Space, Upload } from "antd";
import { addZeroTime, convertDate } from "../../helpers/date";
import { isEmpty } from "../../helpers/typo";
import { addAccount, getAccount } from "../../services/account";
import { PAGINATION } from "../../helpers/constants";
import _ from "lodash";
import { swal } from "../../helpers/swal";

const ExcelJS = require("exceljs");
const DEFAULT_SHEET_TARGET = "Sheet1";

export default function ImportRekeningButton({
  title = "Upload",
  type = "",
  onFinish,
}) {
  // import account modal
  const [importAccountModal, setImportAccountModal] = useState(false);

  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleImportModal = (show) => {
    if (type !== "") {
      if (type === "account") {
        setImportAccountModal(show);
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

      if (type === "account") {
        readAccountExcel(values?.import_data[0]);
      } else {
        setConfirmLoading(false);
      }
    }
  };

  const readAccountExcel = (values) => {
    const workbook = new ExcelJS.Workbook();

    workbook.xlsx
      .load(values?.originFileObj)
      .then(() => {
        const ws = workbook.getWorksheet(DEFAULT_SHEET_TARGET);

        // check read file, make sure file on default sheet target
        if (!isEmpty(ws)) {
          const c1 = ws.getColumn(1);

          const _prep_data = [];

          c1.eachCell((c) => {
            // convert if format type is date
            if (c.type === 4) {
              const _cv = convertDate(c.value);
              const _hh = _cv.hour() - 7;
              const _mm = _cv.minute();
              const _ss = addZeroTime(_cv.second());

              let _fm = `${_hh}.${_mm}`;

              if (_ss !== "00") _fm += `.${_ss}`;

              c.value = _fm;
            }

            // convert to string value
            c.value = String(c.value);

            // get next column (remark rekening)
            const _remark = c?._row?._cells[1]?.value;

            // refer on current table
            const _tabel = [
              "base",
              "group",
              "type",
              "object",
              "object_detail",
              "object_detail_sub",
            ];
            const _field = [
              "account_base",
              "account_base_id",
              "account_group_id",
              "account_type_id",
              "account_object_id",
              "account_object_detail_id",
              "account_object_detail_sub_id",
            ];

            // 4 = Pendapatan
            // 5 = Belanja
            // 6 = Pembiayaan
            if (
              !isEmpty(_remark) &&
              (c.value.startsWith("4") ||
                c.value.startsWith("5") ||
                c.value.startsWith("6"))
            ) {
              _prep_data.push({
                v: c.value, // value
                l: c.value.split(".").length, // level
                s: c.value.split("."), // split
                p: {
                  // payload
                  label: c.value.split(".").pop(),
                  remark: _remark,
                },
                t: _tabel.slice(0, c.value.split(".").length), // table
                f: _field.slice(0, c.value.split(".").length), // field
              });
            }
          });

          if (!!_prep_data.length) {
            // sorting by value
            _.sortBy(_prep_data, ["value"]);
            // recursive function for a while
            doInsertAccount(_prep_data);
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

  const doInsertAccount = (
    data,
    mainIndex = 0,
    childIndex = 0,
    account = null,
    count = 0
  ) => {
    const _target = data[mainIndex];

    // check data target
    if (!isEmpty(_target)) {
      // make filter
      const filters = {
        filters: { label: [_target?.s[childIndex]] },
        pagination: { ...PAGINATION?.pagination, pageSize: 0 },
      };
      // additional filter, either of account base
      if (_target?.l > 1 && childIndex > 0) {
        filters.filters[_target?.f[childIndex]] = [account?.id];
      }

      // get current account
      getAccount(_target?.t[childIndex], filters).then((getting) => {
        // set response
        const _acc = getting?.data[0];

        // check response
        if (getting?.code === 200) {
          // check current account
          if (isEmpty(_acc)) {
            // check level
            if (_target?.l - 1 === childIndex) {
              // make payload
              const payload = { mode: "C", ..._target?.p };
              // additional payload, either of account base
              if (_target?.l > 1 && childIndex > 0) {
                payload[_target?.f[childIndex]] = account?.id;
              }

              // add account if no exist
              addAccount(_target?.t[childIndex], payload).then((adding) => {
                // check response
                if (adding?.code === 200) {
                  // continue to next record if success adding data
                  doInsertAccount(data, mainIndex + 1, 0, null, count + 1);
                } else {
                  // show error and stop loading
                  setConfirmLoading(false);
                }
              });
            } else {
              // do something if exist, continue to next record if account not exist and no need to adding data
              doInsertAccount(data, mainIndex + 1, 0, null, count);
            }
          } else {
            // do something if existhcheck level
            if (_target?.l - 1 === childIndex) {
              // continue to next record if account not exist
              doInsertAccount(data, mainIndex + 1, 0, null, count);
            } else {
              // continue to next child if exist
              doInsertAccount(data, mainIndex, childIndex + 1, _acc, count);
            }
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
        open={importAccountModal}
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
