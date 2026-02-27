import logoImage from "@/public/tmoyelowo.svg";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo = ({ width = 178, height = 57, ...props }: LogoProps) => {
  return (
    <Image
      src={logoImage}
      alt="TMOyelowo Logo"
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Logo;
