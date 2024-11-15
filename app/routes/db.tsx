import type { MetaFunction } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { konversiNilai } from "~/lib/fuzzy";
import { parseIfString } from "~/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import listPengajuan from "~/constants/db.json";

export const meta: MetaFunction = () => {
	return [
		{ title: "View Data" },
		{ name: "description", content: "Welcome to SC!" },
	];
};

export const loader = async () => {
	return json({ listPengajuan });
};

export default function Index() {
	const { listPengajuan } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-screen-xl lg:mx-auto my-5 mx-3 overflow-hidden">
			<PageHeading />
			<TabbedInterface listPengajuan={listPengajuan} />
		</div>
	);
}

const TabbedInterface = ({ listPengajuan }) => {
	const [activeTab, setActiveTab] = React.useState("example");

	return (
		<div className="w-full">
			{/* Tabs */}
			<div className="flex border-b border-gray-300 mb-4">
				<button
					className={`px-4 py-2 text-sm font-medium ${
						activeTab === "example"
							? "border-b-2 border-blue-500 text-blue-500"
							: "text-gray-500 hover:text-blue-500"
					}`}
					onClick={() => setActiveTab("example")}
				>
					Example
				</button>
				<button
					className={`px-4 py-2 text-sm font-medium ${
						activeTab === "dashboard"
							? "border-b-2 border-blue-500 text-blue-500"
							: "text-gray-500 hover:text-blue-500"
					}`}
					onClick={() => setActiveTab("dashboard")}
				>
					Dashboard Admin
				</button>
				<button
					className={`px-4 py-2 text-sm font-medium ${
						activeTab === "json"
							? "border-b-2 border-blue-500 text-blue-500"
							: "text-gray-500 hover:text-blue-500"
					}`}
					onClick={() => setActiveTab("json")}
				>
					JSON Pretty Print
				</button>
			</div>

			{/* Tab Content */}
			<div className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
				{activeTab === "example" && <Example listPengajuan={listPengajuan} />}
				{activeTab === "dashboard" && (
					<DashboardAdmin listPengajuan={listPengajuan} />
				)}
				{activeTab === "json" && <JsonPrettyPrint data={listPengajuan} />}
			</div>
		</div>
	);
};

function sliceName(inputString: string, count?: number) {
	const isCount = count ? count : 20;
	if (inputString && inputString?.length > isCount) {
		return `${inputString.slice(0, isCount)}...`;
	}
	return inputString;
}

const EmptyData = () => {
	return (
		<tr className="text-center">
			<td
				colSpan={6}
				className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
			>
				No data
			</td>
		</tr>
	);
};

const Badge = ({
	bg,
	text,
	content,
}: { content: string; bg: string; text?: string }) => {
	return (
		<span
			className={`text-sm font-semibold inline-flex items-center justify-center rounded-full  px-2.5 py-0.5 ${bg} ${text}`}
		>
			{content}
		</span>
	);
};

const StatusRequest = ({ md }) => {
	return (
		<>
			{md?.tanggalSidang ? (
				<Badge content="Selesai" bg="bg-green-100" text="text-green-800" />
			) : md?.laporanMagang ? (
				<Badge content="Menunggu Sidang" bg="bg-sky-100" />
			) : md?.rancangKRS && !md.validasiDekan ? (
				<Badge
					content="Menunggu Validasi Dekan & Kaprodi"
					bg="bg-slate-100"
					text="text-slate-700"
				/>
			) : md?.validasiDekan ? (
				<Badge
					content="Proses Magang"
					bg="bg-indigo-100"
					text="text-indigo-700"
				/>
			) : md?.status === 1 ? (
				<Badge
					content="Menunggu Disetujui"
					bg="bg-amber-100"
					text="text-amber-700"
				/>
			) : md?.status === 2 ? (
				<Badge
					content="Disetujui"
					bg="bg-emerald-100"
					text="text-emerald-7-00"
				/>
			) : (
				<Badge content="Tidak Lolos" bg="bg-red-100" text="text-red-700" />
			)}
		</>
	);
};

const Thead = () => {
	return (
		<thead className="ltr:text-left rtl:text-right">
			<tr className="bg-white sticky top-0">
				<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
					No
				</th>
				<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
					Nama & Address
				</th>
				<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
					Mata Kuliah
				</th>
				<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
					Jenis Magang
				</th>
				<th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
					Status
				</th>
				<th className="px-4 py-2 font-medium text-gray-900">Nilai</th>
			</tr>
		</thead>
	);
};

const DashboardAdmin = ({ listPengajuan }) => {
	return (
		<div className="max-w-screen-xl lg:mx-auto">
			<h2 className="mb-2.5 text-xl font-semibold">Laporan Admin</h2>
			<div className="overflow-x-auto rounded-lg border border-gray-200  max-h-[80vh] overflow-y-auto">
				<table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
					<Thead />
					<tbody className="divide-y divide-gray-200">
						{listPengajuan && listPengajuan?.length > 0 ? (
							listPengajuan?.map((d, index) => {
								const md = parseIfString(d?.metadata);
								const nilai = parseIfString(md?.nilai);
								return (
									<tr key={index} className="text-center">
										<td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
											{index + 1}
										</td>
										<td className="whitespace-nowrap px-4 py-2 text-gray-700">
											<div className="text-sm text-gray-900 text-start ">
												{md.name}
											</div>
											<div className="text-sm text-gray-500 text-start">
												{md.address}
											</div>
										</td>
										<td className="whitespace-nowrap px-4 py-2 text-gray-700">
											{md?.mataKuliah}
										</td>
										<td className="whitespace-nowrap px-4 py-2 text-gray-700">
											{md?.jenisMagang}
										</td>
										<td className="whitespace-nowrap px-4 py-2 text-gray-700">
											<StatusRequest md={md} />
										</td>
										<td className="whitespace-nowrap px-4 py-2">
											{nilai &&
												nilai?.map((person, index) => (
													<div
														key={index}
														className={`cursor-pointer grid grid-cols-4 ${
															person.category === 1
																? "bg-yellow-50"
																: person.category === 2
																	? "bg-blue-50"
																	: person.category === 3
																		? "bg-green-50"
																		: person.category === 4
																			? "bg-red-50"
																			: ""
														}`}
													>
														<div className="px-4 py-2 font-medium text-gray-900 text-left col-span-3 truncate">
															{sliceName(person.matakuliah)}
														</div>
														<div className="px-6 py-2 font-medium text-gray-900 text-left">
															{person?.score === null
																? "-"
																: konversiNilai(person?.score)}
														</div>
													</div>
												))}
										</td>
									</tr>
								);
							})
						) : (
							<EmptyData />
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const JsonPrettyPrint = ({ data }) => {
	const renderJson = (obj, depth = 0) => {
		return Object.entries(obj).map(([key, value]) => {
			// Cek apakah value adalah string JSON yang bisa di-parse
			let parsedValue = value;
			if (typeof value === "string") {
				try {
					parsedValue = JSON.parse(value);
				} catch (e) {
					// Jika gagal parse, biarkan value tetap dalam bentuk string aslinya
				}
			}

			return (
				<div key={key} style={{ paddingLeft: `${depth * 20}px` }}>
					<strong>{key}:</strong>{" "}
					{typeof parsedValue === "object" && parsedValue !== null ? (
						<div>{renderJson(parsedValue, depth + 1)}</div>
					) : (
						<span>{JSON.stringify(parsedValue)}</span>
					)}
				</div>
			);
		});
	};

	return (
		<details
			className="my-1 group [&_summary::-webkit-details-marker]:hidden w-full"
			open
		>
			<summary className="flex cursor-pointer items-center gap-1.5 rounded-sm border w-fit py-1 px-2 mb-1">
				<span className="font-medium text-xs">DEBUG</span>
			</summary>
			<pre className="text-sm hyphens-auto break-word whitespace-pre-wrap break-all text-md h-[80vh] overflow-y-auto  border border-gray-300 p-4 rounded-l max-w-full">
				{renderJson(data)}
			</pre>
		</details>
	);
};

function Example({ listPengajuan }) {
	return (
		<div className="">
			<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
					<div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg max-h-[80vh] overflow-y-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50 sticky top-0">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										No
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Name
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Mata Kuliah
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Jenis Magang
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Status
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Nilai
									</th>
									<th scope="col" className="relative px-6 py-3">
										<span className="sr-only">Edit</span>
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{listPengajuan && listPengajuan?.length > 0 ? (
									listPengajuan?.map((d, index) => {
										const md = parseIfString(d?.metadata);
										const nilai = parseIfString(md?.nilai);
										return (
											<tr key={index}>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{index + 1}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">{md.name}</div>
													<div className="text-sm text-gray-500">
														{md.address}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{md?.mataKuliah}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{md?.jenisMagang}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<StatusRequest md={md} />
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<PopoverNilai nilai={nilai} />
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<a
														href="#"
														className="text-indigo-600 hover:text-indigo-900"
													>
														Edit
													</a>
												</td>
											</tr>
										);
									})
								) : (
									<EmptyData />
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

import { CircleHelp } from "lucide-react";

import React from "react";
import { Button } from "~/components/ui/button";

function PopoverNilai({ nilai }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm">
					<CircleHelp className="h-4 w-4" />
					<span className="sr-only">Toggle</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="text-sm p-1.5">
				{nilai &&
					nilai?.map((person, index) => (
						<div
							key={index}
							className={`cursor-pointer grid grid-cols-4 ${
								person.category === 1
									? "bg-yellow-50"
									: person.category === 2
										? "bg-blue-50"
										: person.category === 3
											? "bg-green-50"
											: person.category === 4
												? "bg-red-50"
												: ""
							}`}
						>
							<div className="px-4 py-2 font-medium text-gray-900 text-left col-span-3 truncate">
								{person.matakuliah}
							</div>
							<div className="px-6 py-2 font-medium text-gray-900 text-left">
								{person?.score === null ? "-" : konversiNilai(person?.score)}
							</div>
						</div>
					))}
			</PopoverContent>
		</Popover>
	);
}

/* This example requires Tailwind CSS v2.0+ */
function PageHeading() {
	return (
		<div className="md:flex md:items-center md:justify-between">
			<div className="flex-1 min-w-0">
				<h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
					View Data
				</h2>
			</div>
		</div>
	);
}
