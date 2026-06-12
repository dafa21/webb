import os

filepath = 'src/App.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '              {/* Donate Button */}'
replacement = '''              {/* Affiliate Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate("/affiliate");
                  window.scrollTo(0, 0);
                }}
                className={`hidden md:flex items-center justify-center gap-2 rounded-full font-bold text-[10px] xl:text-[12px] transition-all duration-300 ${
                  isScrolled
                    ? "bg-white text-primary-600 border border-primary-100 hover:bg-primary-50 px-3 xl:px-4 py-1.5 xl:py-2"
                    : "bg-white/20 text-white hover:bg-white/30 border border-white/30 px-3 xl:px-4 py-1.5 xl:py-2"
                }`}
              >
                <Award className="w-3.5 h-3.5 xl:w-4 xl:h-4" /> Affiliate
              </motion.button>

              {/* Donate Button */}'''

if 'Affiliate Button' not in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Affiliate button added to header.')
else:
    print('Affiliate button already exists.')
