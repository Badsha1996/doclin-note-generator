import { motion } from "framer-motion";

interface PageHeaderProps{
    title: string
    subTitle: string
}

function PageHeader({title, subTitle}:PageHeaderProps) {
  return (
    <motion.div
      className="text-center max-w-max mx-auto max-h-max"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="bg-gradient-to-r from-pink-400 via-blue-500 to-purple-500 bg-clip-text text-transparent font-extrabold text-4xl py-2"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundSize: "200% 100%",
        }}
      >
        {title}
      </motion.h1>

      <motion.p
        className="text-white text-md mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {subTitle}
      </motion.p>
    </motion.div>
  );
}

export default PageHeader