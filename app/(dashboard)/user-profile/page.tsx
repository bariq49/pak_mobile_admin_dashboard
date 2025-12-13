import UserInfo from "./overview/user-info";
import Teams from "./overview/teams";
import About from "./overview/about";
import Portfolio from "./overview/portfolio";
import Skills from "./overview/skills";
const Overview = () => {
  return (
    <div className="pt-6 grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <UserInfo />
        <Portfolio />
        <Skills />
      </div>
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <About />
        <Teams />
      </div>
    </div>
  );
};

export default Overview;
