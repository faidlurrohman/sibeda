import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import useRole from "./hooks/useRole";

import Masuk from "./pages/auth/Masuk";
import NotFound from "./pages/404";
import Beranda from "./pages/Beranda";

import ProtectedRoute from "./components/ProtectedRoute";
import UnprotectedRoute from "./components/UnprotectedRoute";
import Wrapper from "./components/Wrapper";

import AnggaranKota from "./pages/laporan/AnggaranKota";
import AnggaranGabunganKota from "./pages/laporan/AnggaranGabunganKota";
import PendapatanBelanja from "./pages/laporan/PendapatanBelanja";
import PengaturanKota from "./pages/pengaturan/PengaturanKota";
import PengaturanPenandaTangan from "./pages/pengaturan/PengaturanPenandaTangan";
import PengaturanPengguna from "./pages/pengaturan/PengaturanPengguna";

import Akun from "./pages/rekening/Akun";
import Kelompok from "./pages/rekening/Kelompok";
import Jenis from "./pages/rekening/Jenis";
import Objek from "./pages/rekening/Objek";
import ObjekDetail from "./pages/rekening/ObjekDetail";
import ObjekDetailSub from "./pages/rekening/ObjekDetailSub";

import AnggaranPendapatan from "./pages/transaksi/anggaran/Pendapatan";
import AnggaranBelanja from "./pages/transaksi/anggaran/Belanja";
import AnggaranPembiayaan from "./pages/transaksi/anggaran/Pembiayaan";
import RealisasiPendapatan from "./pages/transaksi/realisasi/Pendapatan";
import RealisasiBelanja from "./pages/transaksi/realisasi/Belanja";
import RealisasiPembiayaan from "./pages/transaksi/realisasi/Pembiayaan";

function DynamicWrapper({ children }) {
  const { id } = useParams();

  if (isNaN(Number(id)) || !/^[0-9]+$/.exec(Number(id))) {
    return <NotFound useNav={false} />;
  }

  return children;
}

function App() {
  const { is_super_admin } = useRole();

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_ROUTER}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Wrapper>
                <Outlet />
              </Wrapper>
            </ProtectedRoute>
          }
        >
          <Route index element={<Beranda />} />
          {is_super_admin && (
            <Route path="/rekening" element={<Outlet />}>
              <Route index element={<Akun />} />
              <Route path="kelompok" element={<Outlet />}>
                <Route index element={<Kelompok />} />
                <Route
                  path=":id"
                  element={
                    <DynamicWrapper>
                      <Kelompok />
                    </DynamicWrapper>
                  }
                />
              </Route>
              <Route path="jenis" element={<Outlet />}>
                <Route index element={<Jenis />} />
                <Route
                  path=":id"
                  element={
                    <DynamicWrapper>
                      <Jenis />
                    </DynamicWrapper>
                  }
                />
              </Route>
              <Route path="objek" element={<Outlet />}>
                <Route index element={<Objek />} />
                <Route
                  path=":id"
                  element={
                    <DynamicWrapper>
                      <Objek />
                    </DynamicWrapper>
                  }
                />
              </Route>
              <Route path="objek_detail" element={<Outlet />}>
                <Route index element={<ObjekDetail />} />
                <Route
                  path=":id"
                  element={
                    <DynamicWrapper>
                      <ObjekDetail />
                    </DynamicWrapper>
                  }
                />
              </Route>
              <Route path="objek_detail_sub" element={<Outlet />}>
                <Route index element={<ObjekDetailSub />} />
                <Route
                  path=":id"
                  element={
                    <DynamicWrapper>
                      <ObjekDetailSub />
                    </DynamicWrapper>
                  }
                />
              </Route>
            </Route>
          )}
          <Route path="/transaksi" element={<Outlet />}>
            <Route
              path="anggaran/pendapatan"
              element={<AnggaranPendapatan />}
            />
            <Route path="anggaran/belanja" element={<AnggaranBelanja />} />
            <Route
              path="anggaran/pembiayaan"
              element={<AnggaranPembiayaan />}
            />
            <Route
              path="realisasi/pendapatan"
              element={<RealisasiPendapatan />}
            />
            <Route path="realisasi/belanja" element={<RealisasiBelanja />} />
            <Route
              path="realisasi/pembiayaan"
              element={<RealisasiPembiayaan />}
            />
          </Route>
          <Route path="/laporan" element={<Outlet />}>
            <Route path="realisasi-anggaran-kota" element={<AnggaranKota />} />
            {is_super_admin && (
              <>
                <Route
                  path="realisasi-anggaran-gabungan-kota"
                  element={<AnggaranGabunganKota />}
                />
                <Route
                  path="rekapitulasi-pendapatan-dan-belanja"
                  element={<PendapatanBelanja />}
                />
              </>
            )}
          </Route>
          {is_super_admin && (
            <Route path="/pengaturan" element={<Outlet />}>
              <Route path="kota" element={<PengaturanKota />} />
              <Route
                path="penanda-tangan"
                element={<PengaturanPenandaTangan />}
              />
              <Route path="pengguna" element={<PengaturanPengguna />} />
            </Route>
          )}
        </Route>
        <Route path="/auth">
          <Route
            path="masuk"
            element={
              <UnprotectedRoute>
                <Masuk />
              </UnprotectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
