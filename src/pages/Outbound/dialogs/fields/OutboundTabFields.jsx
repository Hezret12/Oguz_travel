import HotelFields from "./HotelFields";
import AirwayFields from "./AirwayFields";
import RailwayFields from "./RailwayFields";
import TourFields from "./TourFields";
import TransferFields from "./TransferFields";
import PackageFields from "./PackageFields";

const OutboundTabFields = ({ activeTab, control }) => {
  switch (activeTab) {
    case "hotel":
      return <HotelFields control={control} />;
    case "airway":
      return <AirwayFields control={control} />;
    case "railway":
      return <RailwayFields control={control} />;
    case "tour":
      return <TourFields control={control} />;
    case "transfer":
      return <TransferFields control={control} />;
    case "package":
      return <PackageFields control={control} />;
    default:
      return null;
  }
};

export default OutboundTabFields;
