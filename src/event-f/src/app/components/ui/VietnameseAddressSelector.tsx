import React, { useState, useEffect, useRef } from "react";
import data from "./vietnam-provinces.json"; // Import file JSON
import { TiArrowSortedDown } from "react-icons/ti";

interface VietnameseAddressSelectorProps {
  houseNumber: string;
  ward: string;
  district: string;
  province: string;
  onAddressChange: (data: {
      houseNumber: string;
      ward: string;
      district: string;
      province: string;
  }) => void;
}

export default function VietnameseAddressSelector({
  houseNumber,
  ward,
  district,
  province, onAddressChange }: VietnameseAddressSelectorProps) {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredWards, setFilteredWards] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [localHouseNumber, setLocalHouseNumber] = useState(houseNumber || "");
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
    setLocalHouseNumber(houseNumber || "");
  }, [houseNumber]);

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

  useEffect(() => {
    // Load provinces from JSON or API
    setProvinces(data);
}, []);

useEffect(() => {
    if (province) {
        const selectedProvince = data.find((p: any) => p.name === province);
        setDistricts(selectedProvince ? selectedProvince.districts : []);
    }
}, [province]);

useEffect(() => {
    if (district) {
        const selectedDistrict = districts.find((d: any) => d.name === district);
        setWards(selectedDistrict ? selectedDistrict.wards : []);
    }
}, [district]);

useEffect(() => {
  // Đồng bộ giá trị từ props vào state
  if (province && province !== selectedProvince) {
    setSelectedProvince(province);
    const selectedProvinceData = data.find((p: any) => p.name === province);
    const districts = selectedProvinceData ? selectedProvinceData.districts : [];
    setDistricts(districts);
    setFilteredDistricts(districts);
  }

  if (district && district !== selectedDistrict) {
    setSelectedDistrict(district);
    const selectedDistrictData = districts.find((d: any) => d.name === district);
    const wards = selectedDistrictData ? selectedDistrictData.wards : [];
    setWards(wards);
    setFilteredWards(wards);
  }

  if (ward && ward !== selectedWard) {
    setSelectedWard(ward);
  }
}, [province, district, ward, selectedProvince, selectedDistrict, selectedWard]);

const handleProvinceChange = (value: string) => {
  setSelectedProvince(value);
  setSelectedDistrict("");
  setSelectedWard("");
  setDistricts([]);
  setWards([]);
  setFilteredDistricts([]);
  setFilteredWards([]);

  // Gọi onAddressChange sau khi cập nhật state
  onAddressChange({
    houseNumber: localHouseNumber,
    ward: "",
    district: "",
    province: value,
  });
};

const handleDistrictChange = (value: string) => {
  setSelectedDistrict(value);
  setSelectedWard(""); // Reset phường/xã khi thay đổi quận/huyện
  setWards([]); // Reset danh sách phường/xã
  const updatedAddress = {
    houseNumber: localHouseNumber,
    ward: "",
    district: value,
    province: selectedProvince,
  };
  console.log("Updated Address (District):", updatedAddress);
  onAddressChange(updatedAddress);
};

const handleWardChange = (value: string) => {
  setSelectedWard(value);
  const updatedAddress = {
    houseNumber: localHouseNumber,
    ward: value,
    district: selectedDistrict,
    province: selectedProvince,
  };
  console.log("Updated Address (Ward):", updatedAddress);
  onAddressChange(updatedAddress);
};

const handleHouseNumberChange = (value: string) => {
  setLocalHouseNumber(value);
  onAddressChange({ houseNumber: value, ward: selectedWard, district: selectedDistrict, province: selectedProvince });
};


useEffect(() => {
  console.log("Props on render:", { houseNumber, province, district, ward });
}, [houseNumber, province, district, ward]);

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
              className="border border-gray-300 h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => setShowProvinceMenu(true)}
              onChange={(e) => {
                handleProvinceChange(e.target.value);
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
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    setFilteredDistricts([]);
    setFilteredWards([]);
    setShowProvinceMenu(false);
    onAddressChange({
      houseNumber: localHouseNumber,
      ward: "",
      district: "",
      province: province.name,
    });
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
              className="border border-gray-300 h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => selectedProvince && setShowDistrictMenu(true)}
              onChange={(e) => {
                handleDistrictChange(e.target.value);
                handleFilter(e.target.value, districts, setFilteredDistricts);
              }}
              disabled={!selectedProvince}
            />
            <TiArrowSortedDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 pointer-events-none" />
          </div>
          {showDistrictMenu && (
            <ul className="absolute z-10 bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto w-full">
              {filteredDistricts.map((district) => (
                <li key={district.name}
                  onClick={() => {
                    setSelectedDistrict(district.name);
                    setShowDistrictMenu(false);
                    onAddressChange({
                      houseNumber: localHouseNumber,
                      ward: "",
                      district: district.name,
                      province: selectedProvince,
                    });
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
              className="border border-gray-300 h-9 w-full bg-white rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onFocus={() => selectedDistrict && setShowWardMenu(true)}
              onChange={(e) => {
                handleWardChange(e.target.value);
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
                    onAddressChange({
                      houseNumber: localHouseNumber,
                      ward: ward.name,
                      district: selectedDistrict,
                      province: selectedProvince,
                    });
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
            onChange={(e) => handleHouseNumberChange(e.target.value)}
            placeholder="Nhập số nhà và tên đường"
            className="border border-gray-300 h-9 w-full bg-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}