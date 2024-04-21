import React from "react";
import { Progress } from "antd";

export default function ProgressIndicator({
  percent = 0,
  size = "default",
  color = "#1C4F49",
  showInfo = true,
}) {
  return (
    <Progress
      size={size}
      strokeColor={color}
      percent={percent}
      showInfo={showInfo}
    />
  );
}
