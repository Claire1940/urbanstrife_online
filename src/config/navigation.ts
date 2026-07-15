import type { LucideIcon } from 'lucide-react'
import {
	BookOpen,
	Users,
	Swords,
	Wrench,
	ScrollText,
	Map,
	Rocket,
	Star,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'guide' -> t('nav.guide')
	path: string // URL 路径，如 '/guide'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// Urban Strife 8 个内容分类（与 content/{locale}/ 目录一一对应）
// 顺序：入门指南 → 角色构筑 → 武器装备 → 避难所系统 → 任务流程 → 地图探索 → 发布信息 → 评测
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'builds', path: '/builds', icon: Users, isContentType: true },
	{ key: 'weapons', path: '/weapons', icon: Swords, isContentType: true },
	{ key: 'systems', path: '/systems', icon: Wrench, isContentType: true },
	{ key: 'quests', path: '/quests', icon: ScrollText, isContentType: true },
	{ key: 'locations', path: '/locations', icon: Map, isContentType: true },
	{ key: 'release', path: '/release', icon: Rocket, isContentType: true },
	{ key: 'reviews', path: '/reviews', icon: Star, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['guide', 'builds', ...]

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
