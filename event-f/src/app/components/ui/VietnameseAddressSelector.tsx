import React, { useState, useEffect, useRef } from "react";
import data from "./vietnam-provinces.json"; // Import file JSON
import { TiArrowSortedDown } from "react-icons/ti";

interface VietnameseAddressSelectorProps {
  onAddressChange: (address: string) => void;
}

export default function VietnameseAddressSelector({ onAddressChange }: VietnameseAddressSelectorProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredWards, setFilteredWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [showProvinceMenu, setShowProvinceMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [showWardMenu, setShowWardMenu] = useState(false);

  const provinceRef = useRef<HTMLDivElement>(null);
  const districtRef = useRef<HTMLDivElement>(null);
  const wardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load provinces from JSON
    setProvinces(data);
    setFilteredProvinces(data);
  }, []);

  useEffect(() => {
    // Load districts based on selected province
    if (selectedProvince) {
      const province = data.find((p: any) => p.name === selectedProvince);
      const districts = province ? province.districts : [];
      setDistricts(districts);
      setFilteredDistricts(districts);
      setSelectedDistrict("");
      setWards([]);
      setFilteredWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    // Load wards based on selected district
    if (selectedDistrict) {
      const district = districts.find((d: any) => d.name === selectedDistrict);
      const wards = district ? district.wards : [];
      setWards(wards);
      setFilteredWards(wards);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  useEffect(() => {
    // Generate full address when all fields are selected
    const address = `${houseNumber}${houseNumber ? ", " : ""}${selectedWard ? `Phường/Xã ${selectedWard}, ` : ""}${
      selectedDistrict ? `Quận/Huyện ${selectedDistrict}, ` : ""
    }${selectedProvince ? `Tỉnh/Thành phố ${selectedProvince}` : ""}`;
    onAddressChange(address);
  }, [houseNumber, selectedProvince, selectedDistrict, selectedWard, onAddressChange]);

  const handleFilter = (input: string, list: any[], setFilteredList: (list: any[]) => void) => {
    const filtered = list.filter((item) => item.name.toLowerCase().includes(input.toLowerCase()));
    setFilteredList(filtered);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      provinceRef.current &&
      !provinceRef.current.contains(event.target as Node) &&
      districtRef.current &&
      !districtRef.current.contains(event.target as Node) &&
      wardRef.current &&
      !wardRef.current.contains(event.target as Node)
    ) {
      setShowProvinceMenu(false);
      setShowDistrictMenu(false);
      setShowWardMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg p-4 space-y-4">
      <div className="flex space-x-6">
        <div className="flex-1 relative" ref={provinceRef}>
          <label className="block font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập Tỉnh/Thành phố"
              value={selectedProvince}
              className="h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => setShowProvinceMenu(true)}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                handleFilter(e.target.value, provinces, setFilteredProvinces);
              }}
            />
            <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 pointer-events-none" />
          </div>
          {showProvinceMenu && (
            <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto w-full">
              {filteredProvinces.map((province) => (
                <li
                  key={province.name}
                  onClick={() => {
                    setSelectedProvince(province.name);
                    setShowProvinceMenu(false);
                  }}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedProvince === province.name ? "bg-blue-100" : ""
                  }`}
                >
                  {province.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 relative" ref={districtRef}>
          <label className="block font-medium text-gray-700 mb-2">Quận/Huyện</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập Quận/Huyện"
              value={selectedDistrict}
              className="h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => selectedProvince && setShowDistrictMenu(true)}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                handleFilter(e.target.value, districts, setFilteredDistricts);
              }}
              disabled={!selectedProvince}
            />
            <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 pointer-events-none" />
          </div>
          {showDistrictMenu && (
            <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto w-full">
              {filteredDistricts.map((district) => (
                <li
                  key={district.name}
                  onClick={() => {
                    setSelectedDistrict(district.name);
                    setShowDistrictMenu(false);
                  }}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedDistrict === district.name ? "bg-blue-100" : ""
                  }`}
                >
                  {district.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex space-x-6">
        <div className="flex-1 relative" ref={wardRef}>
          <label className="block font-medium text-gray-700 mb-2">Phường/Xã</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập Phường/Xã"
              value={selectedWard}
              className="h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => selectedDistrict && setShowWardMenu(true)}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                handleFilter(e.target.value, wards, setFilteredWards);
              }}
              disabled={!selectedDistrict}
            />
            <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 pointer-events-none" />
          </div>
          {showWardMenu && (
            <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto w-full">
              {filteredWards.map((ward) => (
                <li
                  key={ward.name}
                  onClick={() => {
                    setSelectedWard(ward.name);
                    setShowWardMenu(false);
                  }}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedWard === ward.name ? "bg-blue-100" : ""
                  }`}
                >
                  {ward.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1">
          <label className="block font-medium text-gray-700 mb-2">Số nhà và đường</label>
          <input
            type="text"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            placeholder="Nhập số nhà và tên đường"
            className="h-9 w-full bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
