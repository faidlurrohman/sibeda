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
import { useNavigate, useParams } from "react-router-dom";
import { checkParams } from "../../helpers/url";
import { lower } from "../../helpers/typo";

export default function ObjekDetail() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [accountObjectDetail, setAccountObjectDetail] = useState([]);
  const [accountObject, setAccountObject] = useState([]);
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
          "object_detail",
          checkParams(params, id, "account_object_id")
        ),
        getAccount(
          "object_detail",
          checkParams(params, id, "account_object_id", true)
        ),
        getAccountList("object"),
      ])
      .then(
        axios.spread((_object_detail, _export, _bases) => {
          setLoading(false);
          setAccountObjectDetail(_object_detail.data);
          setExports(_export.data);
          setAccountObject(_bases?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _object_detail?.total },
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
      setAccountObjectDetail([]);
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
        account_object_id: value?.account_object_id,
        label: value?.label,
        remark: value?.remark,
      });
    } else {
      form.resetFields();
      setEdit(false);

      if (id && accountObject.find((i) => i?.id === Number(id))) {
        form.setFieldsValue({ account_object_id: Number(id) });
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
        setActiveAccount("object_detail", value?.id).then((response) => {
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
    addAccount("object_detail", values).then((response) => {
      setConfirmLoading(false);

      if (response?.code === 200) {
        messageAction(isEdit);
        addUpdateRow();
        reloadTable();
      }
    });
  };

  const onNavigateDetail = (values) => {
    navigate(`/rekening/objek_detail_sub/${values?.id}`);
  };

  const columns = [
    searchColumn(
      tableFilterInputRef,
      "account_object_label",
      "Objek",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "label",
      "Kode Objek Detail",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "remark",
      "Nama Objek Detail",
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
          <ExportButton
            data={exports}
            master={`account_object_detail`}
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
        dataSource={accountObjectDetail}
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
        title={`${isEdit ? `Ubah` : `Tambah`} Data Rekening Objek Detail`}
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
            label="Objek"
            name="account_object_id"
            rules={[
              {
                required: true,
                message: "Objek tidak boleh kosong!",
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
              options={accountObject}
            />
          </Form.Item>
          <Form.Item
            label="Kode Objek Detail"
            name="label"
            rules={[
              {
                required: true,
                message: "Kode Objek Detail tidak boleh kosong!",
              },
            ]}
          >
            <Input disabled={confirmLoading} />
          </Form.Item>
          <Form.Item
            label="Nama Objek Detail"
            name="remark"
            rules={[
              {
                required: true,
                message: "Nama Objek Detail tidak boleh kosong!",
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
