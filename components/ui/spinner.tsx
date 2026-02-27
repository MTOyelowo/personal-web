import type { FC, JSX } from "react";
import { BiLoaderCircle } from "react-icons/bi";

interface Props {
  size?: number;
}

const Spinner: FC<Props> = ({ size = 24 }): JSX.Element => {
  return (
    <>
      <BiLoaderCircle size={size} className="animate-spin" />
    </>
  );
};

export default Spinner;
