import bannerImage from "../assets/led-software.png";
import "./CompanyBanner.css";

function CompanyImage() {
  return (
    <div className="company-banner">
      <img
        src={bannerImage}
        alt="L-ED Software"
        className="banner-image"
      />
    </div>
  );
}

export default CompanyImage;