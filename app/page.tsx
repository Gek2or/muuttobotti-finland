import MuuttobottiApp from "./MuuttobottiApp";
import V11NativeExperience from "./V11NativeExperience";
import PricingGuard from "./PricingGuard";
import CinematicConversionLayer from "./CinematicConversionLayer";

export default function Home() {
  return (
    <>
      <V11NativeExperience />
      <MuuttobottiApp />
      <PricingGuard />
      <CinematicConversionLayer />
    </>
  );
}
