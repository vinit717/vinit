import ArtBackground from "@/components/shader/ArtBackground";
import PlateFrame from "@/components/plate/PlateFrame";
import Cartouche from "@/components/plate/Cartouche";
import StationIndex from "@/components/plate/StationIndex";
import SectionProfile from "@/components/plate/SectionProfile";
import LegendPlate from "@/components/plate/LegendPlate";
import Correspondence from "@/components/plate/Correspondence";

/**
 * The page is a surveyed map sheet, not a portfolio column.
 *
 * There is no navbar, no hero, no status pill and no About/Work/Experience
 * stack — that sequence is the thing every portfolio does. Instead the sheet
 * carries a neatline and graticule that never leave the screen, and the content
 * arrives as plates: a title cartouche, a station index, a section through the
 * years, a legend, and an imprint. The engraved terrain runs behind all of it,
 * so the plates read as windows cut into one continuous piece of ground.
 */
const Index = () => (
  <div className="min-h-screen">
    <ArtBackground />
    <PlateFrame />

    <Cartouche />
    <StationIndex />
    <SectionProfile />
    <LegendPlate />
    <Correspondence />
  </div>
);

export default Index;
