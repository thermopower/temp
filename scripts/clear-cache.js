import { rmSync, existsSync } from "fs"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, "..")

console.log("🧹 Next.js 캐시 정리를 시작합니다...\n")

// 정리할 캐시 디렉토리 및 파일 목록
const cacheTargets = [".next", "node_modules/.cache", ".swc", ".turbo", "out", "dist", ".vercel", ".env.local.backup"]

let cleanedCount = 0

cacheTargets.forEach((target) => {
  const targetPath = join(projectRoot, target)

  if (existsSync(targetPath)) {
    try {
      console.log(`🗑️  ${target} 삭제 중...`)
      rmSync(targetPath, { recursive: true, force: true })
      console.log(`✅ ${target} 삭제 완료`)
      cleanedCount++
    } catch (error) {
      console.error(`❌ ${target} 삭제 실패:`, error.message)
    }
  } else {
    console.log(`⏭️  ${target} - 존재하지 않음`)
  }
})

// TypeScript 캐시 정리
const tsconfigBuildInfo = join(projectRoot, "tsconfig.tsbuildinfo")
if (existsSync(tsconfigBuildInfo)) {
  try {
    console.log("🗑️  TypeScript 빌드 정보 삭제 중...")
    rmSync(tsconfigBuildInfo)
    console.log("✅ TypeScript 빌드 정보 삭제 완료")
    cleanedCount++
  } catch (error) {
    console.error("❌ TypeScript 빌드 정보 삭제 실패:", error.message)
  }
}

console.log(`\n🎉 캐시 정리 완료! ${cleanedCount}개 항목이 정리되었습니다.`)
console.log("\n📝 다음 단계:")
console.log("1. npm run dev 또는 pnpm dev로 개발 서버 재시작")
console.log("2. 브라우저 캐시도 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)")
console.log("3. 문제가 지속되면 node_modules 삭제 후 npm install 재실행\n")
