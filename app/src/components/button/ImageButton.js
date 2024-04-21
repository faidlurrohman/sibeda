import React, { useState } from "react";
import { Button, Image } from "antd";
import InImage from "../../assets/images/in.png";
import OutImage from "../../assets/images/out.png";
import CostImage from "../../assets/images/cost.png";

export default function ImageButton({
  type = "link",
  label = "Preview",
  src = "",
}) {
  const [visible, setVisible] = useState(false);

  let _src = src;

  if (src === "in") _src = InImage;
  else if (src === "out") _src = OutImage;
  else if (src === "cost") _src = CostImage;

  return (
    <>
      <Button type={type} onClick={() => setVisible(true)}>
        {label}
      </Button>
      <Image
        style={{ display: "none" }}
        src={_src}
        preview={{
          visible,
          src: _src,
          onVisibleChange: (value) => {
            setVisible(value);
          },
        }}
      />
    </>
  );
}
