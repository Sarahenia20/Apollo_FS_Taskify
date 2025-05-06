import React from 'react'
import Breadcrumb from '../../components/Breadcrumb'
import DefaultLayout from '../../layout/DefaultLayout'
import ChartFour from '../../components/ChartFour'
import ChartSeven from '../../components/ChartSeven'
import ChartEight from '../../components/ChartEight'
import ChartSix from '../../components/ChartSix'
import ChartNine from '../../components/ChartNine'
import DataStatsTwo from '../../components/DataStatsTwo'
import UsersChartSkills from './UsersChartSkills'
import TeamsCount from './TeamsCount'
import { UseAuth } from "../../hooks/useAuth";

const AdvancedChart = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName='User Chart Inforgraphics' />
      <DataStatsTwo />
      <br></br>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12">
          <UsersChartSkills />
        </div>
        
        <div className="col-span-12 xl:col-span-7">
          <ChartSeven />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <TeamsCount />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <ChartSix />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <ChartNine />
        </div>
      </div>
    </DefaultLayout>
  )
}


export default UseAuth(AdvancedChart, ["ADMIN"]);
