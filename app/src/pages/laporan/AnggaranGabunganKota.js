import React, { useEffect, useRef, useState } from "react";
import { Card, DatePicker, Select, Table } from "antd";
import axios from "axios";
import ReloadButton from "../../components/button/ReloadButton";
import { getCityList } from "../../services/city";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { convertDate, dbDate } from "../../helpers/date";
import { getRealPlanCities } from "../../services/report";
import { searchColumn } from "../../helpers/table";
import { formatterNumber } from "../../helpers/number";
import { lower } from "../../helpers/typo";
import _ from "lodash";
import ExportButton from "../../components/button/ExportButton";
import { Column } from "@ant-design/plots";
import { useAppSelector } from "../../hooks/useRedux";
import { getCost, getInOut } from "../../services/dashboard";

const { RangePicker } = DatePicker;

export default function AnggaranGabunganKota() {
  const [data, setData] = useState([]);
  const [cities, setCities] = useState([]);

  const [chartIn, setChartIn] = useState([]);
  const [chartOut, setChartOut] = useState([]);
  const [chartCost, setChartCost] = useState([]);

  const [loading, setLoading] = useState(false);
  const session = useAppSelector((state) => state.session.user);

  const tableFilterInputRef = useRef(null);
  const [tableFiltered, setTableFiltered] = useState({});
  const [tableSorted, setTableSorted] = useState({});
  const [dateRangeFilter, setDateRangeFilter] = useState([
    convertDate(`${session?.which_year}`).startOf("year"),
    convertDate(`${session?.which_year}`).endOf("year"),
  ]);
  const [cityFilter, setCityFilter] = useState([]);
  const [tablePage, setTablePage] = useState(PAGINATION);

  const columnConfig = {
    appendPadding: 20,
    style: { height: 300 },
    isGroup: true,
    xField: "city",
    yField: "value",
    yAxis: {
      label: {
        formatter: (v) => formatterNumber(v),
      },
    },
    tooltip: {
      formatter: (v) => {
        return { ...v, value: formatterNumber(v?.value) };
      },
    },
    seriesField: "name",
    legend: false,
    color: ["#1ca9e6", "#f88c24"],
    xAxis: { label: { autoRotate: true } },
    scrollbar: { type: "horizontal" },
  };

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getRealPlanCities(params),
        getInOut({
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCost({
          ...params,
          pagination: { ...params.pagination, pageSize: 0 },
        }),
        getCityList(),
      ])
      .then(
        axios.spread((_data, _inOut, _cost, _cities) => {
          setLoading(false);
          setData(_data?.data);
          setCities(_cities?.data);
          setTablePage({
            pagination: {
              ...params.pagination,
              total: _data?.total,
            },
          });

          if (!!(_cities?.data).length) {
            makeChartData(
              _.concat(_inOut?.data, _cost?.data),
              _cities?.data,
              params?.filters
            );
          }
        })
      );
  };

  const makeChartData = (values, cities, filter) => {
    // init chart
    // [
    //   {name: 'Anggaran', value: 0, city: 'Provinsi Kepulauan Riau'},
    //   {name: 'Relisasi', value: 0, city: 'Provinsi Kepulauan Riau'},
    //   {name: 'Anggaran', value: 0, city: 'Kabupaten Anambas'},
    //   {name: 'Relisasi', value: 0, city: 'Kabupaten Anambas'}
    // ]
    let _i = [],
      _o = [],
      _c = [];

    // tampung kota
    let _ct = cities;

    console.log("values", values);

    // cek filter kotanya
    if (filter && filter?.city_id && !!filter?.city_id[0].length) {
      _ct = _.filter(cities, (v) => filter?.city_id[0].includes(v?.id));
    }

    // data kota harus ada baru nampilkan chart
    if (!!_ct.length) {
      _.map(_ct, (ct) => {
        _i.push({
          id: ct?.id,
          city: ct?.label,
          name: "Anggaran",
          value: 0,
        });
        _i.push({
          id: ct?.id,
          city: ct?.label,
          name: "Realisasi",
          value: 0,
        });
        _o.push({
          id: ct?.id,
          city: ct?.label,
          name: "Anggaran",
          value: 0,
        });
        _o.push({
          id: ct?.id,
          city: ct?.label,
          name: "Realisasi",
          value: 0,
        });
        _c.push({
          id: ct?.id,
          city: ct?.label,
          name: "Anggaran",
          value: 0,
        });
        _c.push({
          id: ct?.id,
          city: ct?.label,
          name: "Realisasi",
          value: 0,
        });
      });

      // cari pendapatan = account_base_label (4)
      _i = _.map(_i, (ch) => {
        // cari kota yang ada didata
        let _dct = _.filter(
          values,
          (v) => v?.city_id === ch?.id && v?.account_base_label.includes("(4)")
        );

        if (ch?.name === "Anggaran") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_plan_amount`])),
          };
        } else if (ch?.name === "Realisasi") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_real_amount`])),
          };
        }

        return ch;
      });

      // cari belanja = account_base_label (5)
      _o = _.map(_o, (ch) => {
        // cari kota yang ada didata
        let _dct = _.filter(
          values,
          (v) => v?.city_id === ch?.id && v?.account_base_label.includes("(5)")
        );

        if (ch?.name === "Anggaran") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_plan_amount`])),
          };
        } else if (ch?.name === "Realisasi") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_real_amount`])),
          };
        }

        return ch;
      });

      // cari pembiayaan = account_base_label (6)
      _c = _.map(_c, (ch) => {
        // cari kota yang ada didata
        let _dct = _.filter(
          values,
          (v) => v?.city_id === ch?.id && v?.account_base_label.includes("(6)")
        );

        if (ch?.name === "Anggaran") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_plan_amount`])),
          };
        } else if (ch?.name === "Realisasi") {
          ch = {
            ...ch,
            value: _.sumBy(_dct, (i) => Number(i[`account_base_real_amount`])),
          };
        }

        return ch;
      });
    }

    // set ke state
    setChartIn(_i);
    setChartOut(_o);
    setChartCost(_c);
  };

  const reloadTable = () => {
    setTableFiltered({});
    setTableSorted({});
    setDateRangeFilter([
      convertDate(`${session?.which_year}`).startOf("year"),
      convertDate(`${session?.which_year}`).endOf("year"),
    ]);
    setCityFilter([]);
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [
          [
            dbDate(convertDate(`${session?.which_year}`).startOf("year")),
            dbDate(convertDate(`${session?.which_year}`).endOf("year")),
          ],
        ],
        city_id: null,
      },
    });
  };

  const onTableChange = (pagination, filters, sorter) => {
    setTableFiltered(filters);
    setTableSorted(sorter);
    getData({
      pagination,
      filters: {
        ...filters,
        trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
        city_id: cityFilter ? [cityFilter] : null,
      },
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tablePage.pagination?.pageSize) {
      setData([]);
    }
  };

  const onDateRangeFilterChange = (values) => {
    let useStart = values[0];
    let useEnd = values[1];
    let startYear = convertDate(useStart, "YYYY");
    let endYear = convertDate(useEnd, "YYYY");

    if (startYear !== endYear) {
      useEnd = convertDate(useStart).endOf("year");
      setDateRangeFilter([useStart, useEnd]);
    } else {
      setDateRangeFilter(values);
    }

    setTableFiltered({});
    setTableSorted({});
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [[dbDate(useStart), dbDate(useEnd)]],
        city_id: cityFilter ? [cityFilter] : null,
      },
    });
  };

  const onCityFilterChange = (value) => {
    setCityFilter(value);
    setTableFiltered({});
    setTableSorted({});
    getData({
      ...PAGINATION,
      filters: {
        trans_date: [[dbDate(dateRangeFilter[0]), dbDate(dateRangeFilter[1])]],
        city_id: value ? [value] : null,
      },
    });
  };

  const columns = [
    searchColumn(
      tableFilterInputRef,
      "trans_date",
      "Tanggal",
      null,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "city_label",
      "Kab/Kota",
      null,
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
      "account_object_detail_sub_plan_amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
    searchColumn(
      tableFilterInputRef,
      "account_object_detail_sub_real_amount",
      "Realisasi",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
  ];

  useEffect(() => reloadTable(), []);

  return (
    <>
      <div className="flex flex-col mb-1 space-y-2 sm:space-y-0 sm:space-x-2 sm:flex-row md:space-y-0 md:space-x-2 md:flex-row">
        <div className="flex flex-row md:space-x-2">
          <h2 className="text-xs font-normal text-right w-14 hidden md:inline">
            Tanggal :
          </h2>
          <RangePicker
            popupClassName="dateRangePicker"
            className="w-full h-8 md:w-72"
            allowEmpty={false}
            allowClear={false}
            format={DATE_FORMAT_VIEW}
            defaultValue={dateRangeFilter}
            placeholder={["Tanggal Awal", "Tanggal Akhir"]}
            onChange={onDateRangeFilterChange}
            value={dateRangeFilter}
            disabledDate={(curr) => {
              const useYear =
                curr &&
                convertDate(curr, "YYYY") !== String(session?.which_year);

              return useYear;
            }}
          />
        </div>
        <div className="flex flex-row md:space-x-2">
          <h2 className="text-xs font-normal text-right w-20 hidden md:inline">
            Kab/Kota :
          </h2>
          <Select
            mode="multiple"
            maxTagCount="responsive"
            allowClear
            showSearch
            className="w-full sm:w-60 md:w-60"
            placeholder="Pilih Kab/Kota"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (lower(option?.label) ?? "").includes(lower(input))
            }
            loading={loading}
            options={cities}
            onChange={onCityFilterChange}
            value={cityFilter}
          />
        </div>
        <ReloadButton onClick={reloadTable} stateLoading={loading} />
        {!!data?.length && (
          <ExportButton
            city_id={cityFilter}
            date={dateRangeFilter}
            report={`gabungankota`}
            pdfOrientation="landscape"
            fileName="LAPORAN-REALISASI-ANGGARAN-GABUNGAN-KOTA"
            types={["xlsx"]}
          />
        )}
      </div>
      {!!cities.length && (
        <>
          <div className="flex mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0">
            <Card
              size="small"
              title={
                <span className="text-xs">Anggaran & Realisasi Pendapatan</span>
              }
              bodyStyle={{ padding: 0, margin: 0 }}
              className="text-center w-full"
            >
              <Column {...columnConfig} data={chartIn} loading={loading} />
            </Card>
          </div>
          <div className="flex mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0">
            <Card
              size="small"
              title={
                <span className="text-xs">Anggaran & Realisasi Belanja</span>
              }
              bodyStyle={{ padding: 0, margin: 0 }}
              className="text-center w-full"
            >
              <Column {...columnConfig} data={chartOut} loading={loading} />
            </Card>
          </div>
          <div className="flex mx-0.5 pb-2 space-x-0 space-y-2 md:space-x-2 md:space-y-0">
            <Card
              size="small"
              title={
                <span className="text-xs">Anggaran & Realisasi Pembiayaan</span>
              }
              bodyStyle={{ padding: 0, margin: 0 }}
              className="text-center w-full"
            >
              <Column {...columnConfig} data={chartCost} loading={loading} />
            </Card>
          </div>
        </>
      )}
      <Table
        scroll={{
          scrollToFirstRowOnChange: true,
          x: "100%",
        }}
        bordered
        size="small"
        loading={loading}
        dataSource={data}
        columns={columns}
        rowKey={(record) =>
          `${record?.account_object_detail_sub_id}_${record?.city_id}`
        }
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
    </>
  );
}
