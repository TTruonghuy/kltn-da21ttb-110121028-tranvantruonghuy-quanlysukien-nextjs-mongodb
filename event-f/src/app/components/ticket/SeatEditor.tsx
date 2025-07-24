"use client";
type FabricWithMeta = fabric.Object & { metadata?: any };
import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

const CANVAS_BASE_WIDTH = 1080;
const CANVAS_BASE_HEIGHT = 590;
const SEAT_RADIUS = 14;
const SEAT_GAP = 40;

export default function SeatEditor({
  onClose,
  onSave,
  initialChart,
}: {
  onClose: () => void;
  onSave?: (chartData: any) => void;
  initialChart?: any;
}) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  // Danh sách loại vé
  const [ticketTypes, setTicketTypes] = useState([
    { label: "Thường", value: "Thuong", color: "#bfdbfe", price: 100000 },
  ]);
  const [selectedType, setSelectedType] = useState("Thuong");
  const [addSeatCount, setAddSeatCount] = useState(1);

  const [seatIndex, setSeatIndex] = useState(0);
  const [selectedObjects, setSelectedObjects] = useState<any[]>([]);
  const [showAlignMenu, setShowAlignMenu] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  // Modal tạo loại vé mới
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePrice, setNewTypePrice] = useState(100000);
  const [newTypeColor, setNewTypeColor] = useState("#fca5a5");

  // Modal sửa loại vé
  const [editTypeIdx, setEditTypeIdx] = useState<number | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypePrice, setEditTypePrice] = useState(0);

  // Sân khấu
  const [stageColor, setStageColor] = useState("#e5e7eb");

  // Ghi chú
  const [noteColor, setNoteColor] = useState("#f59e42");


  // Thêm state cho modal chú thích hàng
  const [showRowNote, setShowRowNote] = useState(false);
  const [rowName, setRowName] = useState("");

  // Fullscreen effect
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    if (initialChart && initialChart.ticketTypes) {
      setTicketTypes(initialChart.ticketTypes);
    }
  }, [initialChart]);

  // Thêm sân khấu 
  const handleAddStage = () => {
    if (!canvasRef.current) return;
    const stageRect = new fabric.Rect({
      left: 150, top: 20, width: 200, height: 40,
      fill: stageColor,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    const stageText = new fabric.Text("SÂN KHẤU", {
      fontSize: 18,
      fill: "#222",
      originX: "center",
      originY: "center",
      left: 250,
      top: 40,
      selectable: false,
      evented: false,
    });
    const group = new fabric.Group([stageRect, stageText], {
      left: stageRect.left,
      top: stageRect.top,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    (group as any).metadata = { isStage: true, name: "SÂN KHẤU" };
    canvasRef.current.add(group);
    canvasRef.current.setActiveObject(group);
    canvasRef.current.requestRenderAll();
  }


  const handleRowNote = () => {
    if (!canvasRef.current) return;
    const allLabels = canvasRef.current.getObjects().filter(
      obj => (obj as FabricWithMeta).metadata?.isRowLabel
    );
    if (allLabels.some(label => (label as FabricWithMeta).metadata.rowName === rowName)) {
      alert("Tên hàng đã tồn tại, vui lòng chọn tên khác!");
      return;
    }
    // Lấy các ghế đang chọn
    const selectedSeats = canvasRef.current.getActiveObjects().filter(
      obj => (obj as FabricWithMeta).metadata?.isSeat
    ) as fabric.Group[];
    if (selectedSeats.length < 2) return;

    // Sắp xếp theo left (từ trái sang phải)
    const sorted = [...selectedSeats].sort((a, b) => a.left - b.left);

    // Đặt tên hàng cho từng ghế và reset số ghế trong hàng
    sorted.forEach((group, idx) => {
      (group as FabricWithMeta).metadata.rowName = rowName;
      (group as FabricWithMeta).metadata.rowIndex = idx;
      const textObj = group.item(1) as fabric.Text;
      textObj.set("text", (idx + 1).toString());
    });

    // Hiển thị tên hàng bên trái ghế đầu tiên
    const firstSeat = sorted[0];
    const groupBounds = firstSeat.getBoundingRect();
    const labelLeft = groupBounds.left - 30; // cách trái 30px so với ghế đầu tiên
    const labelTop = groupBounds.top + groupBounds.height / 2 - 8; // căn giữa theo chiều dọc

    const rowLabel = new fabric.Text(rowName, {
      left: labelLeft,
      top: labelTop,
      fontSize: 20,
      fill: "#eab308",
      fontWeight: "bold",
      selectable: true, // Cho phép chọn để xóa chung
      evented: true,
    });
    (rowLabel as any).metadata = { isRowLabel: true, rowName };

    canvasRef.current.add(rowLabel);
    canvasRef.current.requestRenderAll();
    setShowRowNote(false);
    setRowName("");
  };

  //Xoá tên hàng
  const handleDeleteRowLabel = (rowNameToDelete: string) => {
    if (!canvasRef.current) return;
    // Xóa label hàng
    canvasRef.current.getObjects().forEach(obj => {
      if ((obj as FabricWithMeta).metadata?.isRowLabel && (obj as FabricWithMeta).metadata.rowName === rowNameToDelete) {
        canvasRef.current?.remove(obj);
      }
    });
    // Chỉ bỏ ràng buộc tên hàng, giữ nguyên số thứ tự ghế
    const seatsInRow = canvasRef.current.getObjects().filter(
      obj => (obj as FabricWithMeta).metadata?.isSeat && (obj as FabricWithMeta).metadata.rowName === rowNameToDelete
    ) as fabric.Group[];
    seatsInRow.forEach(group => {
      (group as FabricWithMeta).metadata.rowName = undefined;
      (group as FabricWithMeta).metadata.rowIndex = undefined;
      // Không thay đổi text số ghế
    });
    canvasRef.current.requestRenderAll();
  };


  const [canvasLoaded, setCanvasLoaded] = useState(false);
  // Khởi tạo canvas
  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_BASE_WIDTH,
      height: CANVAS_BASE_HEIGHT,
      backgroundColor: "#f3f4f6",
    });
    canvasRef.current = canvas;

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e as MouseEvent;
      if (!opt.target && !evt.shiftKey) {
        isPanning = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        canvas.setCursor('grab');
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning) {
        const evt = opt.e as MouseEvent;
        const deltaX = evt.clientX - lastPosX;
        const deltaY = evt.clientY - lastPosY;
        canvas.relativePan(new fabric.Point(deltaX, deltaY));
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });

    canvas.on('mouse:up', () => {
      isPanning = false;
      canvas.setCursor('default');
    });

    // Lưu các object đang được chọn
    canvas.on("selection:created", (opt) => {
      setSelectedObjects(opt.selected || []);
      // Nếu chọn đúng 1 ghi chú thì lấy màu
      if (opt.selected && opt.selected.length === 1) {
        const obj = opt.selected[0] as FabricWithMeta;
        if (obj.metadata?.isNote) {
          setNoteColor((obj as fabric.Textbox).fill as string || "#f59e42");
        }
      }
    });
    canvas.on("selection:updated", (opt) => {
      setSelectedObjects(opt.selected || []);
      if (opt.selected && opt.selected.length === 1) {
        const obj = opt.selected[0] as FabricWithMeta;
        if (obj.metadata?.isNote) {
          setNoteColor((obj as fabric.Textbox).fill as string || "#f59e42");
        }
      }
    });
    canvas.on("selection:cleared", () => {
      setSelectedObjects([]);
    });



    if (initialChart && initialChart.canvas) {
      canvas.loadFromJSON(initialChart.canvas, () => {
        setCanvasLoaded(true);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      });
    }
    const seats = canvas.getObjects().filter(
      obj => (obj as FabricWithMeta).metadata?.isSeat && obj.type === "group"
    ) as fabric.Group[];

    seats.forEach(oldGroup => {
      const meta = (oldGroup as FabricWithMeta).metadata;
      const type = ticketTypes.find(t => t.value === meta.type) || ticketTypes[0];

      // Tạo lại circle và text với thuộc tính đúng
      const circle = new fabric.Circle({
        left: oldGroup.left,
        top: oldGroup.top,
        radius: SEAT_RADIUS,
        fill: "#fff",
        stroke: "#1e293b",
        strokeWidth: 1,
        hasControls: false,
        hasBorders: false,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      (circle as any).metadata = meta;

      const text = new fabric.Text(meta.index.toString(), {
        fontSize: 12,
        fill: "#222",
        originX: "center",
        originY: "center",
        top: oldGroup.top,
        left: oldGroup.left,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });

      const newGroup = new fabric.Group([circle, text], {
        left: oldGroup.left,
        top: oldGroup.top,
        hasControls: false,
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
      });
      (newGroup as any).metadata = meta;

      canvas.remove(oldGroup);
      canvas.add(newGroup);
    });
    canvas.requestRenderAll();


    // Chuột phải để hiện menu thẳng hàng
    const handleContextMenu = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasElRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (canvasRef.current.getActiveObjects().length > 1) {
        e.preventDefault();
        setShowAlignMenu({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    canvasElRef.current?.addEventListener("contextmenu", handleContextMenu);

    // Thêm sân khấu mặc định
    const stageRect = new fabric.Rect({
      left: 400, top: 20, width: 200, height: 40,
      fill: stageColor,
      stroke: "#fff",
      strokeWidth: 2,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    const stageText = new fabric.Text("SÂN KHẤU", {
      fontSize: 18,
      fill: "#222",
      originX: "center",
      originY: "center",
      left: 500,
      top: 40,
      selectable: false,
      evented: false,
    });
    const group = new fabric.Group([stageRect, stageText], {
      left: stageRect.left,
      top: stageRect.top,
      hasControls: true,
      hasBorders: true,
      selectable: true,
    });
    (group as any).metadata = { isStage: true, name: "SÂN KHẤU" };
    canvas.add(group);

    return () => {
      canvas.dispose();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!canvasLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const typesMap = Object.fromEntries(ticketTypes.map(t => [t.value, t]));
    canvas.getObjects().forEach(obj => {
      // Set cho group
      obj.set({
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: false,
      });
      if ((obj as FabricWithMeta).metadata?.isSeat && obj.type === "group") {
        const group = obj as fabric.Group;
        group.forEachObject(child => {
          child.set({
            selectable: false,
            evented: false,
            hasControls: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
          });
          // Nếu là circle thì set lại màu
          if (child.type === "circle") {
            const meta = (obj as FabricWithMeta).metadata;
            const type = typesMap[meta.type];
            if (type) (child as fabric.Circle).set("fill", type.color);
          }
        });
      }
    });

    canvas.discardActiveObject();
    setSelectedObjects([]);
    canvas.requestRenderAll();
  }, [ticketTypes, canvasLoaded]);



  // Zoom effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setZoom(zoom);
      canvas.requestRenderAll();
    }
  }, [zoom]);

  //Thêm ghế
  const handleAddSeats = (count: number) => {
    if (!canvasRef.current || count < 1) return;
    const type = ticketTypes.find(t => t.value === selectedType) || ticketTypes[0];
    const price = type.price;
    const color = type.color;

    // Tìm vị trí bắt đầu (dưới sân khấu hoặc dưới cùng các ghế hiện tại)
    let y = 60;
    const stage = canvasRef.current.getObjects().find(obj =>
      (obj as FabricWithMeta).metadata?.isStage
    );
    const allSeats = canvasRef.current.getObjects().filter(obj =>
      (obj as FabricWithMeta).metadata?.isSeat
    );
    if (stage) {
      y = stage.top + stage.height + SEAT_GAP;
      if (allSeats.length > 0) {
        const maxY = Math.max(...allSeats.map(obj => obj.top ?? 0));
        y = Math.max(y, maxY + SEAT_GAP);
      }
    } else {
      if (allSeats.length > 0) {
        const maxY = Math.max(...allSeats.map(obj => obj.top ?? 0));
        y = maxY + SEAT_GAP;
      }
    }

    // Tìm vị trí trái bắt đầu
    let leftStart = 60;
    let maxIndex = seatIndex;
    for (let i = 0; i < count; i++) {
      let left = leftStart + i * SEAT_GAP;
      // Kiểm tra vị trí không bị đè
      const objs = canvasRef.current.getObjects();
      while (objs.some(o =>
        (o as FabricWithMeta).metadata?.isSeat &&
        o.left && o.top &&
        Math.abs(o.left - left) < SEAT_RADIUS * 2 + 4 &&
        Math.abs(o.top - y) < SEAT_RADIUS * 2 + 4
      )) {
        left += SEAT_GAP;
      }
      const index = maxIndex + 1;
      maxIndex = index;

      const circle = new fabric.Circle({
        left,
        top: y,
        radius: SEAT_RADIUS,
        fill: color,
        stroke: "#1e293b",
        strokeWidth: 1,
        hasControls: false,
        hasBorders: false,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
      (circle as any).metadata = { index, type: type.value, price, isSeat: true, rowIndex: index };

      const text = new fabric.Text(index.toString(), {
        fontSize: 12,
        fill: "#222",
        originX: "center",
        originY: "center",
        top: y,
        left,
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });

      const group = new fabric.Group([circle, text], {
        left,
        top: y,
        hasControls: false,
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        selectable: true,
        evented: true,
        lockMovementX: false,
        lockMovementY: false,
        lockRotation: false,
      });
      (group as any).metadata = { index, type: type.value, price, isSeat: true, rowIndex: index };

      canvasRef.current.add(group);
    }
    setSeatIndex(maxIndex);
    canvasRef.current.requestRenderAll();
  };

  // Thẳng hàng các ghế đang chọn (theo hàng ngang)
  const handleAlignHorizontal = () => {
    if (!canvasRef.current) return;
    const selected = canvasRef.current.getActiveObjects().filter(obj =>
      (obj as FabricWithMeta).metadata && (obj as FabricWithMeta).metadata.isSeat
    );
    if (selected.length < 2) return;
    const y = selected[0].top;
    const sorted = [...selected].sort((a, b) => a.left - b.left);
    const left0 = sorted[0].left;
    sorted.forEach((obj, idx) => {
      obj.set({ top: y, left: left0 + idx * SEAT_GAP });
    });
    canvasRef.current.requestRenderAll();
    setShowAlignMenu(null);
  };

  // Thẳng cột (theo chiều dọc)
  const handleAlignVertical = () => {
    if (!canvasRef.current) return;
    const selected = canvasRef.current.getActiveObjects().filter(obj =>
      (obj as FabricWithMeta).metadata && (obj as FabricWithMeta).metadata.isSeat
    );
    if (selected.length < 2) return;
    const x = selected[0].left;
    const sorted = [...selected].sort((a, b) => a.top - b.top);
    const top0 = sorted[0].top;
    sorted.forEach((obj, idx) => {
      obj.set({ left: x, top: top0 + idx * SEAT_GAP });
    });
    canvasRef.current.requestRenderAll();
    setShowAlignMenu(null);
  };

  // Xóa object đang chọn (nhiều đối tượng)
  const handleDeleteSelected = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const active = canvas.getActiveObject();
    if (active) {
      let deletedRowName: string | undefined;
      let deletedIsSeat = false;
      if ((active as FabricWithMeta).metadata?.isSeat) {
        deletedRowName = (active as FabricWithMeta).metadata.rowName;
        deletedIsSeat = true;
      }
      if (active.type === "activeSelection") {
        const objects = (active as fabric.ActiveSelection).getObjects();
        canvas.remove(...objects);
        // Nếu xóa nhiều ghế, cập nhật lại các hàng bị ảnh hưởng
        const affectedRows = Array.from(new Set(objects
          .filter(obj => (obj as FabricWithMeta).metadata?.isSeat)
          .map(obj => (obj as FabricWithMeta).metadata.rowName)
          .filter(Boolean)));
        affectedRows.forEach(rowName => {
          const seatsInRow = canvas.getObjects().filter(
            obj => (obj as FabricWithMeta).metadata?.isSeat && (obj as FabricWithMeta).metadata.rowName === rowName
          ) as fabric.Group[];
          seatsInRow
            .sort((a, b) => a.left - b.left)
            .forEach((group, idx) => {
              (group as FabricWithMeta).metadata.rowIndex = idx;
              const textObj = group.item(1) as fabric.Text;
              textObj.set("text", idx.toString());
            });
        });
      } else {
        canvas.remove(active);
        // Nếu ghế vừa xóa thuộc hàng nào, cập nhật lại số ghế trong hàng đó
        if (deletedRowName && deletedIsSeat) {
          const seatsInRow = canvas.getObjects().filter(
            obj => (obj as FabricWithMeta).metadata?.isSeat && (obj as FabricWithMeta).metadata.rowName === deletedRowName
          ) as fabric.Group[];
          seatsInRow
            .sort((a, b) => a.left - b.left)
            .forEach((group, idx) => {
              (group as FabricWithMeta).metadata.rowIndex = idx;
              const textObj = group.item(1) as fabric.Text;
              textObj.set("text", idx.toString());
            });
        }
      }
      canvas.discardActiveObject();
      setSelectedObjects([]);
      canvas.requestRenderAll();
    }
  };

  // Thêm loại vé mới
  const handleAddType = () => {
    if (!newTypeName.trim()) return;
    setTicketTypes(types => [
      ...types,
      {
        label: newTypeName,
        value: newTypeName.replace(/\s/g, "_") + "_" + Date.now(),
        color: newTypeColor,
        price: newTypePrice,
      },
    ]);
    setShowAddType(false);
    setNewTypeName("");
    setNewTypePrice(100000);
    setNewTypeColor("#fca5a5");
  };

  // Sửa loại vé
  const handleEditType = (idx: number) => {
    setEditTypeIdx(idx);
    setEditTypeName(ticketTypes[idx].label);
    setEditTypePrice(ticketTypes[idx].price);
  };
  const handleSaveEditType = () => {
    if (editTypeIdx === null) return;
    const oldType = ticketTypes[editTypeIdx];
    setTicketTypes(types =>
      types.map((t, i) =>
        i === editTypeIdx
          ? { ...t, label: editTypeName, price: editTypePrice }
          : t
      )
    );
    // Cập nhật lại tất cả ghế đã áp loại vé này
    if (canvasRef.current) {
      canvasRef.current.getObjects().forEach(obj => {
        if (
          (obj as FabricWithMeta).metadata &&
          (obj as FabricWithMeta).metadata.isSeat &&
          (obj as FabricWithMeta).metadata.type === oldType.value
        ) {
          (obj as FabricWithMeta).metadata.price = editTypePrice;
          (obj as FabricWithMeta).metadata.label = editTypeName;
        }
      });
      canvasRef.current.requestRenderAll();
    }
    setEditTypeIdx(null);
  };

  // Đổi màu ghế theo loại vé
  const handleApplyTypeToSeats = (typeValue: string) => {
    if (!canvasRef.current) return;
    const type = ticketTypes.find(t => t.value === typeValue);
    if (!type) return;
    const selected = canvasRef.current.getActiveObjects().filter(obj =>
      (obj as FabricWithMeta).metadata && (obj as FabricWithMeta).metadata.isSeat
    );
    selected.forEach(obj => {
      // Đổi màu cho hình tròn trong group
      if (obj.type === "group") {
        const group = obj as fabric.Group;
        const circle = group.item(0) as fabric.Circle;
        circle.set("fill", type.color);
      }
      (obj as FabricWithMeta).metadata.type = type.value;
      (obj as FabricWithMeta).metadata.price = type.price;
      (obj as FabricWithMeta).metadata.label = type.label;
    });
    canvasRef.current?.requestRenderAll();
  };


  // Đổi màu loại vé và cập nhật tất cả ghế đã áp loại vé này
  const handleEditTypeColor = (idx: number, color: string) => {
    const typeValue = ticketTypes[idx].value;
    setTicketTypes(types =>
      types.map((t, i) => (i === idx ? { ...t, color } : t))
    );
    // Cập nhật màu cho tất cả ghế đã áp loại vé này
    if (canvasRef.current) {
      canvasRef.current.getObjects().forEach(obj => {
        if (
          (obj as FabricWithMeta).metadata &&
          (obj as FabricWithMeta).metadata.isSeat &&
          (obj as FabricWithMeta).metadata.type === typeValue
        ) {
          if (obj.type === "group") {
            const group = obj as fabric.Group;
            const circle = group.item(0) as fabric.Circle;
            circle.set("fill", color);
          }
        }
      });
      canvasRef.current.requestRenderAll();
    }
  };

  // Đổi màu sân khấu
  const handleStageColorChange = (color: string) => {
    setStageColor(color);
    if (canvasRef.current) {
      const stage = canvasRef.current.getObjects().find(
        obj => (obj as FabricWithMeta).metadata && (obj as FabricWithMeta).metadata.isStage
      ) as fabric.Group | undefined;
      if (stage) {
        const rect = stage.item(0) as fabric.Rect;
        rect.set("fill", color);
        canvasRef.current.requestRenderAll();
      }
    }
  };

  // Đổi màu ghi chú
  const handleNoteColorChange = (color: string) => {
    setNoteColor(color);
    if (
      selectedObjects.length === 1 &&
      (selectedObjects[0] as FabricWithMeta).metadata?.isNote
    ) {
      const note = selectedObjects[0] as fabric.Textbox;
      note.set("fill", color);
      canvasRef.current?.requestRenderAll();
    }
  };

  const handleDeleteType = (idx: number) => {
    if (idx === 0) return; // Không cho xóa loại vé mặc định
    const typeValue = ticketTypes[idx].value;
    setTicketTypes(types => types.filter((_, i) => i !== idx));
    // Cập nhật lại các ghế đã gán loại vé này về loại vé mặc định đầu tiên
    if (canvasRef.current) {
      const defaultType = ticketTypes[0];
      canvasRef.current.getObjects().forEach(obj => {
        if (
          (obj as FabricWithMeta).metadata &&
          (obj as FabricWithMeta).metadata.isSeat &&
          (obj as FabricWithMeta).metadata.type === typeValue
        ) {
          (obj as FabricWithMeta).metadata.type = defaultType.value;
          (obj as FabricWithMeta).metadata.price = defaultType.price;
          (obj as FabricWithMeta).metadata.label = defaultType.label;
          if (obj.type === "group") {
            const group = obj as fabric.Group;
            const circle = group.item(0) as fabric.Circle;
            circle.set("fill", defaultType.color);
          }
        }
      });
      canvasRef.current.requestRenderAll();
    }
  };

  const handleAddNote = () => {
    if (!canvasRef.current) return;
    const note = new fabric.Textbox("Ghi chú mới", {
      left: 100,
      top: 100,
      fontSize: 18,
      fill: noteColor,
      borderColor: "#f59e42",
      editable: true,
      width: 180,
      fontWeight: "bold",
      padding: 6,
    });
    (note as any).metadata = { isNote: true };
    canvasRef.current.add(note);
    canvasRef.current.setActiveObject(note);
    canvasRef.current.requestRenderAll();
  };

  // Kiểm tra có đang chọn sân khấu không
  const isStageSelected = selectedObjects.length === 1 &&
    (selectedObjects[0] as FabricWithMeta).metadata &&
    (selectedObjects[0] as FabricWithMeta).metadata.isStage;

  // Kiểm tra có đang chọn ghi chú không
  const isNoteSelected = selectedObjects.length === 1 &&
    (selectedObjects[0] as FabricWithMeta).metadata?.isNote;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-blue-100">
      {/* Thanh công cụ */}
      <div className="flex items-center px-6 py-2 border-b bg-gray-50">
        <button className=" bg-red-600 text-white px-3 py-1 rounded text-sm mr-2" onClick={onClose}>Đóng</button>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-2"
          onClick={() => {
            if (onSave && canvasRef.current) {
              // Lấy tất cả ghế
              const seats = canvasRef.current.getObjects().filter(
                obj => (obj as FabricWithMeta).metadata?.isSeat
              ) as fabric.Group[];

              // Chuyển thành array đúng schema
              const seatsData = seats.map((group) => {
                const meta = (group as FabricWithMeta).metadata;
                return {
                  seatId: `${meta.rowName || "X"}-${meta.rowIndex ?? meta.index}`,
                  rowName: meta.rowName || "",
                  seatNumber: meta.rowIndex ?? meta.index,
                  ticketType: meta.type,
                  price: meta.price,
                  sold: meta.sold || false,
                  position: { left: group.left, top: group.top },
                };
              });

              // Chuẩn bị dữ liệu đúng schema
              const chartData = {
                seats: seatsData,
                ticketTypes: ticketTypes.map(t => ({
                  type: t.value,
                  label: t.label,
                  color: t.color,
                  price: t.price,
                })),
                canvas: canvasRef.current?.toJSON(["metadata"]), // Đảm bảo luôn có trường này
              };

              onSave(chartData);
            }
          }}
        >
          Lưu
        </button>

        <button
          className="px-3 py-1 text-sm border-l hover:bg-gray-100"
          onClick={() => handleAddSeats(addSeatCount)}
        >
          Thêm ghế
        </button>
        <input
          type="text"
          min={1}
          max={50}
          value={addSeatCount}
          onChange={e => setAddSeatCount(Number(e.target.value))}
          className="border rounded px-2 py-1 w-16 text-sm mr-2"
        />

        <button className=" px-3 py-1 text-sm  border-l hover:bg-gray-100" onClick={handleAddStage}>Tạo sân khấu</button>
        <button className=" px-3 py-1 text-sm border-l mr-2 hover:bg-gray-100" onClick={handleAddNote}>Thêm ghi chú</button>

        {selectedObjects.length > 1 && selectedObjects.every(obj => (obj as any).metadata?.isSeat) && (
          <button
            className="px-3 py-1 text-sm border-r border-l mr-2 hover:bg-gray-100"
            onClick={() => setShowRowNote(true)}
          >
            Chú thích hàng
          </button>
        )}

        <button className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))}>-</button>
        <span className="px-2 text-sm">{Math.round(zoom * 100)}%</span>
        <button className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>+</button>
        {selectedObjects.length > 0 &&
          !(selectedObjects.length === 1 && (selectedObjects[0] as any).metadata?.isRowLabel) && (
            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm ml-2" onClick={handleDeleteSelected}>
              Xóa
            </button>
          )}
        {selectedObjects.length === 1 && (selectedObjects[0] as any).metadata?.isRowLabel && (
          <button
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm ml-2"
            onClick={() => handleDeleteRowLabel((selectedObjects[0] as any).metadata.rowName)}
          >
            Xóa chú thích hàng
          </button>
        )}
        {selectedObjects.length > 1 && selectedObjects.every(obj => (obj as any).metadata?.isSeat) && (
          <div className="relative">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm ml-2"
              onClick={e => {
                // Lấy vị trí của nút trên màn hình
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setShowAlignMenu({ x: rect.left, y: rect.bottom });
              }}
            >
              Sắp xếp
            </button>
            {showAlignMenu && (
              <ul
                style={{
                  position: "absolute",
                  left: 0,
                  top: 36,
                  zIndex: 1000,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  padding: 4,
                  minWidth: 140,
                }}
                className="shadow"
              >
                <li>
                  <button className="block px-3 py-1 text-sm hover:bg-gray-100 w-full text-left" onClick={handleAlignHorizontal}>Xếp ngang</button>
                </li>
                <li>
                  <button className="block px-3 py-1 text-sm hover:bg-gray-100 w-full text-left" onClick={handleAlignVertical}>Xếp dọc</button>
                </li>
              </ul>
            )}
          </div>
        )}
        {/* Đổi màu sân khấu nếu đang chọn */}
        {isStageSelected && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm">Màu sân khấu:</span>
            <input
              type="color"
              value={stageColor}
              onChange={e => handleStageColorChange(e.target.value)}
              style={{ width: 36, height: 24, border: "none", background: "none" }}
              title="Đổi màu sân khấu"
            />
          </div>
        )}
        {/* Đổi màu ghi chú nếu đang chọn */}
        {isNoteSelected && (
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm">Màu ghi chú:</span>
            <input
              type="color"
              value={noteColor}
              onChange={e => handleNoteColorChange(e.target.value)}
              style={{ width: 36, height: 24, border: "none", background: "none" }}
              title="Đổi màu ghi chú"
            />
          </div>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 flex overflow-auto ml-2 mt-2" style={{ position: "relative" }}>
        {/* Canvas */}
        <canvas
          ref={canvasElRef}
          height={CANVAS_BASE_HEIGHT}
          style={{ border: "1px solid #ccc", maxWidth: "100%", maxHeight: "100%", marginTop: 0 }}
          onContextMenu={e => {
            // Chỉ hiện menu khi click chuột phải và chọn nhiều ghế
            if (selectedObjects.length > 1 && selectedObjects.every(obj => (obj as any).metadata?.isSeat)) {
              e.preventDefault();
              setShowAlignMenu({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
            } else {
              setShowAlignMenu(null);
            }
          }}
        />

        {/* Danh sách loại vé bên phải */}
        <div className="ml-3 w-64 h-fit" style={{ minWidth: 220 }}>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded text-sm mb-3 w-full"
            onClick={() => setShowAddType(true)}
          >
            Tạo loại vé
          </button>

          <div className=" w-64 h-fit" style={{ minWidth: 220, maxHeight: 550, overflowY: "auto" }}>
            {ticketTypes.map((type, idx) => (
              <div key={type.value + "_" + idx} className="rounded border border-gray-200 flex flex-col gap-1 bg-white p-3 mb-2">
                {/* Dòng 1: Tên loại và nút sửa */}
                <div className="flex items-center gap-2">
                  {editTypeIdx === idx ? (
                    <>
                      <input
                        className="border rounded px-1 py-0.5 w-24 text-sm"
                        value={editTypeName}
                        onChange={e => setEditTypeName(e.target.value)}
                      />
                      <button className="text-white text-xs ml-10 px-2 py-1 rounded bg-green-500" onClick={handleSaveEditType}>Lưu</button>
                      <button className="text-white text-xs px-2 py-1 rounded bg-red-500" onClick={() => setEditTypeIdx(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Loại vé:</span>
                          <span className="font-semibold text-base">{type.label}</span>
                        </div>
                        <button
                          className="bg-blue-500 text-xs px-2 py-1 rounded text-white ml-auto"
                          onClick={() => handleEditType(idx)}
                        >
                          Sửa
                        </button>
                        {idx !== 0 && (
                          <button
                            className="bg-red-500 text-xs px-2 py-1 rounded text-white"
                            onClick={() => handleDeleteType(idx)}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Màu sắc:</span>
                  <input
                    type="color"
                    value={type.color}
                    onChange={e => handleEditTypeColor(idx, e.target.value)}
                    style={{ width: 50, height: 24, border: "none", background: "none" }}
                    title="Đổi màu"
                  />
                </div>
                {/* Dòng 2: Giá */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">Giá:</span>
                  {editTypeIdx === idx ? (
                    <input
                      className="border rounded px-1 py-0.5 w-20 text-sm"
                      type="number"
                      value={editTypePrice}
                      min={0}
                      onChange={e => setEditTypePrice(Number(e.target.value))}
                    />
                  ) : (
                    <span className="text-sm ">{type.price.toLocaleString()}đ</span>
                  )}
                </div>
                {/* Dòng 3: Áp giá */}
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm mt-2"
                  onClick={() => handleApplyTypeToSeats(type.value)}
                  disabled={selectedObjects.length === 0}
                >
                  Áp giá
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
      {/* Modal tạo loại vé */}
      {showAddType && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000060]">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px]">
            <div className="mb-2 font-semibold text-lg">Tạo loại vé mới</div>
            <label className="block mb-1 text-sm">Tên loại vé:</label>
            <input type="text" className="border rounded px-2 py-1 w-full text-sm mb-2" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} />
            <label className="block mb-1 text-sm">Giá vé:</label>
            <input type="number" className="border rounded px-2 py-1 w-full text-sm mb-2" value={newTypePrice} onChange={e => setNewTypePrice(Number(e.target.value))} min={0} step={1000} />
            <label className="block mb-1 text-sm">Màu sắc:</label>
            <input type="color" className="w-12 h-8 mb-3" value={newTypeColor} onChange={e => setNewTypeColor(e.target.value)} />
            <div className="flex gap-3 justify-end">
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setShowAddType(false)}>Hủy</button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={!newTypeName} onClick={handleAddType}>Tạo</button>
            </div>
          </div>
        </div>
      )}


      {showRowNote && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000060]">
          <div className="bg-white p-6 rounded shadow-lg min-w-[320px]">
            <div className="mb-2 font-semibold text-lg">Đặt tên cho hàng ghế</div>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full text-sm mb-4"
              value={rowName}
              onChange={e => setRowName(e.target.value)}
              placeholder="Tên hàng ghế (ví dụ: A, B, H1...)"
            />
            <div className="flex gap-3 justify-end">
              <button className="bg-gray-400 text-white px-3 py-1 rounded" onClick={() => setShowRowNote(false)}>Hủy</button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded" disabled={!rowName} onClick={handleRowNote}>Lưu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}