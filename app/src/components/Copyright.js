import { convertDate } from "../helpers/date";

export default function Copyright() {
  return (
    <div className="text-center text-xs font-light">
      {`Copyright ©`}{" "}
      <span className="text-secondary">{` ${process.env.REACT_APP_NAME} `}</span>
      {convertDate(new Date(), "YYYY")}
    </div>
  );
}
