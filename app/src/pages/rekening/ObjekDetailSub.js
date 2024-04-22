import {
  App,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  addAccount,
  getAccount,
  getAccountList,
  setActiveAccount,
} from "../../services/account";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import { messageAction } from "../../helpers/response";
import axios from "axios";
import { useParams } from "react-router-dom";
import { checkParams } from "../../helpers/url";
import { lower } from "../../helpers/typo";

export default function ObjekDetailSub() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();

  const [accountObjectDetailSub, setAccountObjectDetailSub] = useState([]);
  const [accountObjectDetail, setAccountObjectDetail] = useState([]);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);

  const tableFilterInputRef = useRef(null);
  const [tableFiltered, setTableFiltered] = useState({});
  const [tableSorted, setTableSorted] = useState({});
  const [tablePage, setTablePage] = useState(PAGINATION);

  const [isShow, setShow] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getAccount(
          "object_detail_sub",
          checkParams(params, id, "account_object_detail_id")
        ),
        getAccount(
          "object_detail_sub",
          checkParams(params, id, "account_object_detail_id", true)
        ),
        getAccountList("object_detail"),
      ])
      .then(
        axios.spread((_object_detail_sub, _export, _bases) => {
          setLoading(false);
          setAccountObjectDetailSub(_object_detail_sub.data);
          setExports(_export.data);
          setAccountObjectDetail(_bases?.data);
          setTablePage({
            pagination: {
              ...params.pagination,
              total: _object_detail_sub?.total,
            },
          });
        })
      );
  };

  const onTableChange = (pagination, filters, sorter) => {
    setTableFiltered(filters);
    setTableSorted(sorter);
    getData({ pagination, filters, ...sorter });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tablePage.pagination?.pageSize) {
      setAccountObjectDetailSub([]);
    }
  };

  const reloadTable = () => {
    setTableFiltered({});
    setTableSorted({});
    getData(PAGINATION);
  };

  const addUpdateRow = (isEdit = false, value = null) => {
    setShow(!isShow);

    if (isEdit) {
      setEdit(true);
      form.setFieldsValue({
        id: value?.id,
        account_object_detail_id: value?.account_object_detail_id,
        label: value?.label,
        remark: value?.remark,
      });
    } else {
      form.resetFields();
      setEdit(false);

      if (id && accountObjectDetail.find((i) => i?.id === Number(id))) {
        form.setFieldsValue({ account_object_detail_id: Number(id) });
      }
    }
  };

  const onActiveChange = (value) => {
    modal.confirm({
      title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
      content: (
        <>
          ({value?.label}) {value?.remark}
        </>
      ),
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk() {
        setActiveAccount("object_detail_sub", value?.id).then((response) => {
          if (response?.code === 200) {
            messageAction(true);
            reloadTable();
          }
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    values.mode = isEdit ? "U" : "C";

    setConfirmLoading(true);
    addAccount("object_detail_sub", values).then((response) => {
      setConfirmLoading(false);

      if (response?.code === 200) {
        messageAction(isEdit);
        addUpdateRow();
        reloadTable();
      }
    });
  };

  const columns = [
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_label",
      "Objek Detail",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "label",
      "Kode Objek Detail Sub",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "remark",
      "Nama Objek Detail Sub",
      tableFiltered,
      true,
      tableSorted
    ),
    activeColumn(tableFiltered),
    actionColumn(addUpdateRow, onActiveChange),
  ];

  useEffect(() => getData(PAGINATION), []);

  return (
    <>
      <div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        <AddButton onClick={addUpdateRow} stateLoading={loading} />
        {!!exports?.length && (
          <ExportButton
            data={exports}
            master={`account_object_detail_sub`}
            pdfOrientation={`landscape`}
          />
        )}
      </div>
      <Table
        scroll={{
          scrollToFirstRowOnChange: true,
          x: "100%",
        }}
        bordered
        size="small"
        loading={loading}
        dataSource={accountObjectDetailSub}
        columns={columns}
        rowKey={(record) => record?.id}
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
      <Modal
        style={{ margin: 10 }}
        centered
        open={isShow}
        title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Objek Detail Sub`}
        onCancel={() => (confirmLoading ? null : addUpdateRow())}
        closable={false}
        footer={null}
      >
        <Divider />
        <Form
          form={form}
          labelCol={{ span: 8 }}
          labelAlign="left"
          onFinish={handleAddUpdate}
          autoComplete="off"
          initialValues={{ id: "" }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Objek Detail"
            name="account_object_detail_id"
            rules={[
              {
                required: true,
                message: "Objek Detail tidak boleh kosong!",
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (lower(option?.label) ?? "").includes(lower(input))
              }
              disabled={confirmLoading}
              loading={loading}
              options={accountObjectDetail}
            />
          </Form.Item>
          <Form.Item
            label="Kode Objek Detail Sub"
            name="label"
            rules={[
              {
                required: true,
                message: "Kode Objek Detail Sub tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Nama Objek Detail Sub"
            name="remark"
            rules={[
              {
                required: true,
                message: "Nama Objek Detail Sub tidak boleh kosong!",
              },
            ]}
          >
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              disabled={confirmLoading}
            />
          </Form.Item>
          <Divider />
          <Form.Item className="text-right mb-0">
            <Space direction="horizontal">
              <Button disabled={confirmLoading} onClick={() => addUpdateRow()}>
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
