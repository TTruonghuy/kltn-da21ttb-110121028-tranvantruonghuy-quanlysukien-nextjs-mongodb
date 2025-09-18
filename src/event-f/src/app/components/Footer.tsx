export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white pt-8 pb-4 mt-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        
        {/* Cột 1 - Logo & giới thiệu */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Ve++</h2>
          <p className="text-sm">
            Nền tảng quản lý và bán vé sự kiện nhanh chóng, tiện lợi, bảo mật cao.
          </p>
        </div>

        {/* Cột 2 - Liên kết nhanh */}
        <div>
          <h3 className="font-semibold mb-3">Liên kết nhanh</h3>
          <ul className="space-y-2 text-sm">
            <li><a  className="hover:underline">Sự kiện</a></li>
            <li><a  className="hover:underline">Về chúng tôi</a></li>
            <li><a  className="hover:underline">Liên hệ</a></li>
            <li><a  className="hover:underline">Câu hỏi thường gặp</a></li>
          </ul>
        </div>

        {/* Cột 3 - Hỗ trợ */}
        <div>
          <h3 className="font-semibold mb-3">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li><a  className="hover:underline">Điều khoản sử dụng</a></li>
            <li><a className="hover:underline">Chính sách bảo mật</a></li>
            <li><a  className="hover:underline">Chính sách hoàn tiền</a></li>
          </ul>
        </div>

        {/* Cột 4 - Liên hệ */}
        <div>
          <h3 className="font-semibold mb-3">Liên hệ</h3>
          <p className="text-sm">Email: support@ezzone.com</p>
          <p className="text-sm">Hotline: 0123 456 789</p>
        </div>

      </div>

      {/* Dòng bản quyền */}
      <div className="mt-6 border-t border-blue-400 pt-3 text-center text-sm">
        © 2025 Ve++. All rights reserved.
      </div>
    </footer>
  );
}
