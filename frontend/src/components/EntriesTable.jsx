import React from "react";
import { FaTachometerAlt, FaFolderOpen, FaUsers, FaCog, FaSearch, FaFilter, FaSort, FaEllipsisH } from "react-icons/fa";

const EntriesTable = () => {
    return (
        <div className="max-w-5xl mx-auto border border-[#A4CCD9] rounded-xl p-6 sm:p-8 bg-white">
            <h2 className="text-base font-normal mb-1 text-gray-900">Project Entries</h2>
            <p className="text-gray-500 mb-4 text-sm">
                Manage and track all your active projects and their progress
            </p>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-4">
                <div className="flex-1">
                    <div className="relative text-gray-400 focus-within:text-gray-600">
                        <span className="absolute inset-y-0 left-3 flex items-center pl-1 pointer-events-none">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#A4CCD9] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48B3AF] focus:border-transparent"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    className="mt-3 sm:mt-0 inline-flex items-center space-x-1 border border-[#A4CCD9] rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-[#EBFFD8] focus:outline-none focus:ring-2 focus:ring-[#48B3AF]"
                >
                    <FaFilter />
                    <span>Filter</span>
                </button>
                <button
                    type="button"
                    className="mt-3 sm:mt-0 inline-flex items-center space-x-1 border border-[#A4CCD9] rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-[#EBFFD8] focus:outline-none focus:ring-2 focus:ring-[#48B3AF]"
                >
                    <FaSort />
                    <span>Sort</span>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border border-[#A4CCD9] rounded-lg">
                    <thead className="bg-white border-b border-[#A4CCD9]">
                        <tr>
                            {["Project", "Assignee", "Status", "Priority", "Due Date", "Budget", "Progress"].map((col, i) => (
                                <th key={i} className="font-semibold px-4 py-3 border-r border-[#A4CCD9] last:border-r-0">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#A4CCD9]">
                        {/* Row 1 */}
                        <tr>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <p className="font-semibold leading-tight text-gray-900">E-commerce Platform Redesign</p>
                                <p className="text-gray-400 text-xs mt-0.5">PRJ-001</p>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9] flex items-center space-x-3">
                                <img
                                    alt="Sarah Chen"
                                    className="w-8 h-8 rounded-full object-cover"
                                    src="https://storage.googleapis.com/a1aa/image/ef6bf4b5-68af-468e-dc91-d8880f61ab51.jpg"
                                />
                                <span>Sarah Chen</span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#8DBCC7] text-[#1e3a8a] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    In Progress
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#48B3AF] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    High
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">2024-01-15</td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">$45,000</td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                <progress className="w-16 h-2 rounded-full overflow-hidden" max="100" value="75" style={{ accentColor: "#48B3AF" }} />
                                <span className="text-gray-400 text-xs select-none">75%</span>

                            </td>
                        </tr>
                        {/* Row 2 */}
                        <tr>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <p className="font-semibold leading-tight text-gray-900">
                                    Mobile App Development
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">PRJ-002</p>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9] flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#C4E1E6] text-[#48B3AF] flex items-center justify-center font-semibold text-xs select-none">
                                    AR
                                </div>
                                <span>Alex Rodriguez</span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#EBFFD8] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    Planning
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#EBFFD8] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    Medium
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">2024-02-28</td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">$32,500</td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                <progress
                                    className="progress-bar w-16 h-2 rounded-full overflow-hidden"
                                    max="100"
                                    style={{ accentColor: "#48B3AF" }}
                                    value="25"
                                ></progress>
                                <span className="text-gray-400 text-xs select-none">25%</span>
                                <i className="fas fa-ellipsis-h text-gray-600 cursor-pointer"></i>
                            </td>
                        </tr>

                        <tr>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <p className="font-semibold leading-tight text-gray-900">
                                    Brand Identity Refresh
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">PRJ-003</p>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9] flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#C4E1E6] text-[#48B3AF] flex items-center justify-center font-semibold text-xs select-none">
                                    EJ
                                </div>
                                <span>Emily Johnson</span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#EBFFD8] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    Completed
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#EBFFD8] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    Low
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">2023-12-20</td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">$18,750</td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                <progress
                                    className="progress-bar w-16 h-2 rounded-full overflow-hidden"
                                    max="100"
                                    style={{ accentColor: "#48B3AF" }}
                                    value="100"
                                ></progress>
                                <span className="text-gray-400 text-xs select-none">100%</span>
                                <i className="fas fa-ellipsis-h text-gray-600 cursor-pointer"></i>
                            </td>
                        </tr>

                        <tr>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <p className="font-semibold leading-tight text-gray-900">
                                    Data Analytics Dashboard
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">PRJ-004</p>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9] flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#C4E1E6] text-[#48B3AF] flex items-center justify-center font-semibold text-xs select-none">
                                    MK
                                </div>
                                <span>Michael Kim</span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#8DBCC7] text-[#1e3a8a] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    In Progress
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#48B3AF] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    High
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">2024-01-30</td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">$67,200</td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                <progress
                                    className="progress-bar w-16 h-2 rounded-full overflow-hidden"
                                    max="100"
                                    style={{ accentColor: "#48B3AF" }}
                                    value="60"
                                ></progress>
                                <span className="text-gray-400 text-xs select-none">60%</span>
                                <i className="fas fa-ellipsis-h text-gray-600 cursor-pointer"></i>
                            </td>
                        </tr>

                        <tr>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <p className="font-semibold leading-tight text-gray-900">
                                    Customer Support Portal
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">PRJ-005</p>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9] flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-[#C4E1E6] text-[#48B3AF] flex items-center justify-center font-semibold text-xs select-none">
                                    LW
                                </div>
                                <span>Lisa Wang</span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#A4CCD9] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    On Hold
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">
                                <span className="inline-block bg-[#EBFFD8] text-[#48B3AF] text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                                    Medium
                                </span>
                            </td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">2024-03-15</td>
                            <td className="px-4 py-3 border-r border-[#A4CCD9]">$28,900</td>
                            <td className="px-4 py-3 flex items-center space-x-2">
                                <progress
                                    className="progress-bar w-16 h-2 rounded-full overflow-hidden"
                                    max="100"
                                    style={{ accentColor: "#48B3AF" }}
                                    value="15"
                                ></progress>
                                <span className="text-gray-400 text-xs select-none">15%</span>
                                <i className="fas fa-ellipsis-h text-gray-600 cursor-pointer"></i>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>

    );
}

export default EntriesTable;