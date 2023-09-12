import { Form, Input, Button, Checkbox } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { loginAction } from "../../store/actions/session";
import logoPortal from "../../assets/images/logo-portal-kepriprov.png";
import backgroundVideo from "../../assets/video/auth.mp4";

export default function Masuk() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.session?.loading);
  const [form] = Form.useForm();

  const handleSubmit = (params) => {
    dispatch(loginAction(params));

    if (params?.remember) {
      localStorage.setItem("sk-u", params?.username || "");
      localStorage.setItem("sk-p", params?.password || "");
      localStorage.setItem("sk-c", params?.remember || false);
    } else {
      localStorage.setItem("sk-u", "");
      localStorage.setItem("sk-p", "");
      localStorage.setItem("sk-c", false);
    }
  };

  useEffect(() => {
    const remember = localStorage.getItem("sk-c");

    if (remember && remember === "true") {
      form.setFieldsValue({
        username: localStorage.getItem("sk-u"),
        password: localStorage.getItem("sk-p"),
        remember: true,
      });
    }
  }, []);

  return (
    <section className="flex flex-col">
      <div className="relative z-[1] overflow-hidden w-full h-screen">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-center object-cover"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="absolute top-0 left-0 w-full h-full z-[1] bg-patterns bg-repeat bg-black bg-opacity-40 flex justify-center items-center">
          <div className="flex flex-col items-center w-screen">
            <div className="flex flex-row text-center justify-center">
              <img alt="Logo" className="w-20 md:w-28" src={logoPortal} />
            </div>
            <h1 className="font-black text-xl text-white tracking-wider animate-bounce text-center">
              {process.env.REACT_APP_NAME}
            </h1>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="bg-main bg-opacity-90 rounded-lg shadow-lg px-4 pt-4 pb-2 m-0 w-11/12 md:m-auto lg:m-auto md:w-1/3 lg:w-1/4"
            >
              <Form.Item
                label={<span className="text-white">Nama Pengguna</span>}
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Nama Pengguna tidak boleh kosong",
                  },
                ]}
              >
                <Input allowClear />
              </Form.Item>
              <Form.Item
                label={<span className="text-white">Kata Sandi</span>}
                name="password"
                rules={[
                  { required: true, message: "Kata Sandi tidak boleh kosong" },
                ]}
              >
                <Input.Password allowClear />
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox className="checkbox-login">Pengingat Saya</Checkbox>
              </Form.Item>
              <Form.Item>
                <Button
                  loading={loading}
                  block
                  type="primary"
                  htmlType="submit"
                >
                  Masuk
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
