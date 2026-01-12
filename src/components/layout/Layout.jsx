
// import { Outlet } from "react-router-dom";
// import AppBar from "../appBar/AppBar";
// import Sidebar from "../sideBar/SideBar";

// const Layout = () => {


//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden" style={{ paddingRight: 0, marginRight: 0 }}>
//         {/* Navbar */}
//         <AppBar/>

//         {/* Content p-4 lg:p-6*/}
//         <main 
//           className="flex-1 overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500" 
//           style={{ paddingLeft: 0, paddingRight: 0, marginRight: 0 }}
//         >
//           <Outlet /> {/* <-- Nested routes will render here */}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

import { Outlet } from "react-router-dom";
import AppBar from "../appBar/AppBar";
import Sidebar from "../sideBar/SideBar";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* AppBar - Full Width at Top */}
      <AppBar />

      {/* Second Row: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main 
          className="flex-1 overflow-y-auto bg-gray-50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
        >
          <Outlet /> {/* Nested routes render here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;