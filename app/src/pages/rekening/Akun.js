import { App, Button, Divider, Form, Input, Modal, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import {
  addAccount,
  getAccount,
  setActiveAccount,
} from "../../services/account";
import { PAGINATION } from "../../helpers/constants";
import { actionColumn, activeColumn, searchColumn } from "../../helpers/table";
import { messageAction } from "../../helpers/response";
import ReloadButton from "../../components/button/ReloadButton";
import AddButton from "../../components/button/AddButton";
import ExportButton from "../../components/button/ExportButton";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ImportRekeningButton from "../../components/button/ImportRekeningButton";

export default function Akun() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [accountBase, setAccountBase] = useState([]);
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
        getAccount("base", params),
        getAccount("base", {
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
      ])
      .then(
        axios.spread((_data, _export) => {
          setLoading(false);
          setExports(_export?.data);
          setAccountBase(_data?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _data?.total },
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
      setAccountBase([]);
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
        label: value?.label,
        remark: value?.remark,
      });
    } else {
      form.resetFields();
      setEdit(false);
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
        setActiveAccount("base", value?.id).then((response) => {
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
    addAccount("base", values).then((response) => {
      setConfirmLoading(false);

      if (response?.code === 200) {
        messageAction(isEdit);
        addUpdateRow();
        reloadTable();
      }
    });
  };

  const onNavigateDetail = (values) => {
    navigate(`kelompok/${values?.id}`);
  };

  const columns = [
    searchColumn(
      tableFilterInputRef,
      "label",
      "Kode Akun",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "remark",
      "Nama Akun",
      tableFiltered,
      true,
      tableSorted
    ),
    activeColumn(tableFiltered),
    actionColumn(addUpdateRow, onActiveChange, null, onNavigateDetail),
  ];

  useEffect(() => getData(PAGINATION), []);

  return (
    <>
      <div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        <AddButton onClick={addUpdateRow} stateLoading={loading} />
        {!!exports?.length && (
          <ExportButton data={exports} master={`account_base`} />
        )}
        <ImportRekeningButton type="account" onFinish={() => reloadTable()} />
      </div>
      <Table
        scroll={{
          scrollToFirstRowOnChange: true,
          x: "100%",
        }}
        bordered
        size="small"
        loading={loading}
        dataSource={accountBase}
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
        title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Akun`}
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
            label="Kode Akun"
            name="label"
            rules={[
              {
                required: true,
                message: "Kode Akun tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Nama Akun"
            name="remark"
            rules={[
              {
                required: true,
                message: "Nama Akun tidak boleh kosong!",
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
