import MatterHeader from "@/components/MatterHeader";
import WeeklyQuestion from "@/components/WeeklyQuestion";
import PersonalArchive from "@/components/PersonalArchive";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <MatterHeader />
      <WeeklyQuestion />
      <PersonalArchive />
    </div>
  );
};

export default Index;
