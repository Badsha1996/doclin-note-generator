import { motion } from "framer-motion";

function ConfigContent() {
  return (
    <div className="flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full  p-6 rounded-3xl overflow-hidden 
                   bg-white/10"
        style={{
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-pink-500 via-rose-400 to-orange-400 p-4 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Appearance
            </h2>
            <p className="text-white/80">Customize the look and feel</p>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 p-4 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">
              Notifications
            </h2>
            <p className="text-white/80">
              Manage your notification preferences
            </p>
          </div>

          {/* Privacy */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-green-400 p-4 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">Privacy</h2>
            <p className="text-white/80">Control your privacy settings</p>
          </div>

          {/* Account */}
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-400 p-4 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold mb-2 text-white">Account</h2>
            <p className="text-white/80">Manage your account settings</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ConfigContent;
