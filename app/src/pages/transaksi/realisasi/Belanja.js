import {
  App,
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  COLORS,
  DATE_FORMAT_VIEW,
  PAGINATION,
} from "../../../helpers/constants";
import {
  actionColumn,
  activeColumn,
  searchColumn,
} from "../../../helpers/table";
import ReloadButton from "../../../components/button/ReloadButton";
import AddButton from "../../../components/button/AddButton";
import ExportButton from "../../../components/button/ExportButton";
import { messageAction } from "../../../helpers/response";
import { getCityList } from "../../../services/city";
import { convertDate, dbDate, viewDate } from "../../../helpers/date";
import axios from "axios";
import useRole from "../../../hooks/useRole";
import { formatterNumber, parserNumber } from "../../../helpers/number";
import { lower } from "../../../helpers/typo";
import {
  addReal,
  getAccountObjectDetailSub,
  getLastReal,
  getReal,
  setActiveReal,
} from "../../../services/real";

export default function RealisasiBelanja() {
  const { modal } = App.useApp();
  const { is_super_admin } = useRole();
  const [form] = Form.useForm();

  const [transactions, setTransactions] = useState([]);
  const [cities, setCities] = useState([]);
  const [accountObjectDetailSub, setAccountObjectDetailSub] = useState([]);
  const [lastTransaction, setLastTransaction] = useState({});
  const [lastTransactionLoading, setLastTransactionLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);

  const tableFilterInputRef = useRef(null);
  const [tableFiltered, setTableFiltered] = useState({});
  const [tableSorted, setTableSorted] = useState({});
  const [tablePage, setTablePage] = useState(PAGINATION);

  const [isShow, setShow] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getReal("out", params),
        getReal("out", {
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCityList(),
        getAccountObjectDetailSub("out"),
      ])
      .then(
        axios.spread((_real, _export, _cities, _objects) => {
          setLoading(false);
          setTransactions(_real?.data);
          setExports(_export?.data);
          setCities(_cities?.data);
          setAccountObjectDetailSub(_objects?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _real?.total },
          });
        })
      );
  };

  const onTableChange = (pagination, filters, sorter) => {
    setTableFiltered(filters);
    setTableSorted(sorter);
    getData({
      pagination,
      filters: { ...filters },
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tablePage.pagination?.pageSize) {
      setTransactions([]);
    }
  };

  const reloadTable = () => {
    setTableFiltered({});
    setTableSorted({});
    getData(PAGINATION);
  };

  const addData = () => {
    setShow(true);
    setShowCard(false);
    setLastTransaction({});
    form.resetFields();
  };

  const onActiveChange = (value) => {
    modal.confirm({
      title: `${value?.active ? `Nonaktifkan` : `Aktifkan`} data :`,
      content: (
        <>
          {value?.city_label} - {value?.account_object_detail_sub_label}
        </>
      ),
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk() {
        setActiveReal(value?.id).then((response) => {
          if (response?.code === 200) {
            messageAction(true);
            reloadTable();
          }
        });
      },
    });
  };

  const handleAddUpdate = (values) => {
    let cur = {
      ...values,
      trans_date: dbDate(values?.trans_date),
      city_id: !!cities.length ? cities[0]?.id : 0,
      plan_amount: 0,
      mode: "C",
    };

    if (
      cur?.trans_date === lastTransaction?.trans_date &&
      cur?.trans_date !== dbDate(convertDate().startOf("year"))
    ) {
      cur = {
        ...cur,
        id: lastTransaction?.id,
        mode: "U",
      };
    }

    setConfirmLoading(true);
    addReal(cur).then((response) => {
      setConfirmLoading(false);

      if (response?.code === 200) {
        messageAction();
        setShow(false);
        reloadTable();
      }
    });
  };

  const handleObjectChange = () => {
    let currValues = form.getFieldsValue();

    if (currValues?.trans_date && currValues?.account_object_detail_sub_id) {
      setLastTransactionLoading(true);
      getLastReal("out", {
        trans_date: dbDate(currValues?.trans_date),
        account_object_detail_sub_id: currValues?.account_object_detail_sub_id,
      }).then((response) => {
        setLastTransactionLoading(false);

        if (response?.code === 200 && response?.total > 0) {
          setShowCard(true);
          setLastTransaction(response?.data[0]);
        } else {
          setShowCard(false);
          setLastTransaction({});
        }
      });
    }
  };

  const columns = [
    searchColumn(
      tableFilterInputRef,
      "trans_date",
      "Tanggal",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "city_label",
      "Kota",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_label",
      "Objek Detail Sub Rekening",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "real_amount",
      "Realisasi",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
  ];

  useEffect(() => getData(PAGINATION), []);

  return (
    <>
      <div className="flex flex-col mb-2 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        {!is_super_admin && (
          <AddButton onClick={addData} stateLoading={loading} />
        )}
        {!!exports?.length && (
          <ExportButton
            data={exports}
            master={`transaction`}
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
        dataSource={transactions}
        columns={
          is_super_admin
            ? columns.concat(
                activeColumn(tableFiltered),
                actionColumn(null, onActiveChange)
              )
            : columns
        }
        rowKey={(record) => record?.id}
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
      <Modal
        style={{ margin: 10 }}
        centered
        open={isShow}
        title={`Tambah Data Transaksi Realisasi Belanja`}
        onCancel={() => (confirmLoading ? null : setShow(false))}
        closable={false}
        footer={null}
      >
        <Spin spinning={lastTransactionLoading}>
          <Divider />
          {showCard && (
            <Card className="mb-4">
              <h4 className="text-center p-0 mt-0">Riwayat Data Terakhir</h4>
              <div className="flex flex-1 flex-row space-x-7">
                <div className="flex-0 flex-col space-y-2">
                  <div>
                    <h4 className="md:inline">{`Tanggal Transaksi`}</h4>
                  </div>
                  <div>
                    <h4 className="md:inline">{`Anggaran (Rp)`}</h4>
                  </div>
                  <div>
                    <h4 className="md:inline">{`Realisasi (Rp)`}</h4>
                  </div>
                </div>
                <div className="flex-1 flex-col space-y-2">
                  <div>
                    <h4 className="md:inline">
                      :{" "}
                      {lastTransaction?.trans_date
                        ? viewDate(lastTransaction?.trans_date)
                        : `-`}
                    </h4>
                  </div>
                  <div>
                    <h4 className="md:inline">
                      :{" "}
                      {lastTransaction?.plan_amount >= 0
                        ? formatterNumber(lastTransaction?.plan_amount || 0)
                        : `-`}
                    </h4>
                  </div>
                  <div>
                    <h4 className="md:inline">
                      :{" "}
                      {lastTransaction?.real_amount >= 0
                        ? formatterNumber(lastTransaction?.real_amount || 0)
                        : `-`}
                    </h4>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <Form
            form={form}
            labelCol={{ span: 9 }}
            labelAlign="left"
            onFinish={handleAddUpdate}
            autoComplete="off"
            initialValues={{
              trans_date: convertDate(),
              city_label: !!cities.length ? cities[0]?.label : ``,
              real_amount: 0,
            }}
          >
            <Form.Item
              label="Tanggal Transaksi"
              name="trans_date"
              rules={[
                {
                  required: true,
                  message: "Tanggal Transaksi tidak boleh kosong!",
                },
              ]}
            >
              <DatePicker
                className="w-full"
                format={DATE_FORMAT_VIEW}
                allowClear={false}
                onChange={handleObjectChange}
                disabledDate={(curr) => {
                  const nextDay = curr && curr.valueOf() > convertDate();
                  const diffYear =
                    curr &&
                    convertDate(curr, "YYYY") !==
                      convertDate(convertDate(), "YYYY");

                  return nextDay || diffYear;
                }}
              />
            </Form.Item>
            <Form.Item
              label="Kota"
              name="city_label"
              rules={[
                {
                  required: true,
                  message: "Kota tidak boleh kosong!",
                },
              ]}
            >
              <Input
                disabled
                style={{ background: COLORS.white, color: COLORS.black }}
              />
            </Form.Item>
            <Form.Item
              label="Objek Detail Sub Rekening"
              name="account_object_detail_sub_id"
              rules={[
                {
                  required: true,
                  message: "Objek Detail Sub Rekening tidak boleh kosong!",
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
                options={accountObjectDetailSub}
                onChange={handleObjectChange}
              />
            </Form.Item>
            <Form.Item
              label="Realisasi (Rp)"
              name="real_amount"
              rules={[
                {
                  required: true,
                  message: "Realisasi tidak boleh kosong!",
                },
                () => ({
                  validator(_, value) {
                    if (value < 0) {
                      return Promise.reject("Realisasi minus");
                    } else {
                      return Promise.resolve();
                    }
                  },
                }),
              ]}
            >
              <InputNumber
                className="w-full"
                disabled={confirmLoading}
                formatter={(value) => formatterNumber(value)}
                parser={(value) => parserNumber(value)}
              />
            </Form.Item>
            <Divider />
            <Form.Item className="text-right mb-0">
              <Space direction="horizontal">
                <Button
                  disabled={confirmLoading}
                  onClick={() => setShow(false)}
                >
                  Kembali
                </Button>
                <Button
                  loading={confirmLoading}
                  htmlType="submit"
                  type="primary"
                >
                  Simpan
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}
