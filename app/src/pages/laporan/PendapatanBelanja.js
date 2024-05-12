import React, { useEffect, useRef, useState } from "react";
import { DatePicker, Select, Table } from "antd";
import axios from "axios";
import ReloadButton from "../../components/button/ReloadButton";
import { getCityList } from "../../services/city";
import { DATE_FORMAT_VIEW, PAGINATION } from "../../helpers/constants";
import { convertDate, dbDate } from "../../helpers/date";
import { getRecapitulationCities } from "../../services/report";
import { searchColumn } from "../../helpers/table";
import _ from "lodash";
import ExportButton from "../../components/button/ExportButton";
import { lower } from "../../helpers/typo";
import { getAccountList } from "../../services/account";
import { useAppSelector } from "../../hooks/useRedux";

const { RangePicker } = DatePicker;

export default function PendapatanBelanja() {
  const [data, setData] = useState([]);
  const [cities, setCities] = useState([]);
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

  const getData = (params) => {
    setLoading(true);
    axios
      .all([
        getRecapitulationCities(params),
        getCityList(),
        getAccountList("base"),
      ])
      .then(
        axios.spread((_data, _cities, _bases) => {
          setLoading(false);
          setData(_data?.data);
          setCities(_cities?.data);
          setTablePage({
            pagination: { ...params.pagination, total: _data?.total },
          });
        })
      );
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
      "account_base_label",
      "Akun Rekening",
      tableFiltered,
      true,
      tableSorted
    ),
    searchColumn(
      tableFilterInputRef,
      "account_base_plan_amount",
      "Anggaran",
      tableFiltered,
      true,
      tableSorted,
      "int"
    ),
    searchColumn(
      tableFilterInputRef,
      "account_base_real_amount",
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
            report={`rekapitulasi`}
            pdfOrientation="landscape"
            fileName="LAPORAN-REALISASI-ANGGARAN-GABUNGAN-KOTA"
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
        dataSource={data}
        columns={columns}
        rowKey={(record) => `${record?.account_base_id}_${record?.city_id}`}
        onChange={onTableChange}
        pagination={tablePage.pagination}
        tableLayout="auto"
      />
    </>
  );
}
