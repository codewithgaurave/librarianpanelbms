import Dashboard from "../dashboard/Dashboard";
import LibraryQRCode from "../library/LibraryQRCode";
import ManageBankDetails from "../library/ManageBankDetails";
import ManageBookings from "../library/ManageBookings";
import ManageProfile from "../library/ManageProfile";
import ManageSeats from "../library/ManageSeats";
import ManageTimeSlots from "../library/ManageTimeSlots";
import MyEarnings from "../library/MyEarnings";
import ViewAttendances from "../library/ViewAttendances";

// Import icons from react-icons
import { MdDashboard } from "react-icons/md"; // Dashboard
import { FaUniversity } from "react-icons/fa"; // Bank/Institution
import { BsGrid3X3 } from "react-icons/bs"; // Grid
import { AiOutlineClockCircle } from "react-icons/ai"; // Time
import { FaRegCalendarCheck } from "react-icons/fa"; // Calendar check
import { MdAccessTime } from "react-icons/md"; // Attendance/Time
import { BsQrCode } from "react-icons/bs"; // QR Code
import { FaMoneyBillWave } from "react-icons/fa"; // Earnings

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
    name: "Dashboard",
    icon: MdDashboard,
  },
  {
    path: "/dashboard/manage-profile",
    component: ManageProfile,
    name: "Manage Library",
    icon: FaUniversity,
  },
  {
    path: "/dashboard/manage-seats",
    component: ManageSeats,
    name: "Manage Seats",
    icon: BsGrid3X3,
  },
  {
    path: "/dashboard/manage-timeslot",
    component: ManageTimeSlots,
    name: "Manage TimeSlot",
    icon: AiOutlineClockCircle,
  },
  {
    path: "/dashboard/manage-bookings",
    component: ManageBookings,
    name: "Manage Bookings",
    icon: FaRegCalendarCheck,
  },
  {
    path: "/dashboard/view-attendances",
    component: ViewAttendances,
    name: "View Attendances",
    icon: MdAccessTime,
  },
  {
    path: "/dashboard/qr-code",
    component: LibraryQRCode,
    name: "Library QrCode",
    icon: BsQrCode,
  },
  {
    path: "/dashboard/manage-bank-details",
    component: ManageBankDetails,
    name: "Manage Bank Details",
    icon: FaUniversity,
  },
  {
    path: "/dashboard/my-earnings",
    component: MyEarnings,
    name: "My Earnings",
    icon: FaMoneyBillWave,
  },
];

export default routes;
