import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { seedData } from '../data/seedData'
import { parseCSVToQuestions } from '../utils/csv'
import { calculateStreak, formatDateKey } from '../utils/streak'
import type {
    Topic,
    SubTopic,
    Question,
    QuestionInput,
    QuestionUpdate,
    FilterDifficulty,
    FilterStatus,
    Theme,
    Progress,
    ExportPayload,
    ImportMode,
    ActivityLog,
    StreakInfo
} from '../types'

export const useQuestionStore = defineStore('questions', {
    state: () => ({
        topics: useLocalStorage<Topic[]>('qs-topics', seedData.topics),
        subTopics: useLocalStorage<SubTopic[]>('qs-subtopics', seedData.subTopics),
        questions: useLocalStorage<Question[]>('qs-questions', seedData.questions),
        activityLog: useLocalStorage<ActivityLog>('qs-activity', {}),
        theme: useLocalStorage<Theme>('qs-theme', 'dark'),
        searchQuery: '' as string,
        filterDifficulty: '' as FilterDifficulty,
        filterStatus: '' as FilterStatus
    }),

    getters: {
        sortedTopics: (state): Topic[] => {
            return [...state.topics].sort((a, b) => a.order - b.order)
        },

        getSubTopicsByTopic: (state) => (topicId: string): SubTopic[] => {
            return state.subTopics
                .filter(st => st.topicId === topicId)
                .sort((a, b) => a.order - b.order)
        },

        getQuestionsByTopic: (state) => (topicId: string, subTopicId: string | null = null): Question[] => {
            return state.questions
                .filter(q => q.topicId === topicId && q.subTopicId === subTopicId)
                .sort((a, b) => a.order - b.order)
        },

        streakInfo: (state): StreakInfo => {
            return calculateStreak(state.activityLog)
        },

        getDueForReviewQuestions: (state): Question[] => {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
            return state.questions.filter(q => {
                if (!q.isStarred && !q.isRevision) return false
                if (!q.lastPracticedAt) return true
                return new Date(q.lastPracticedAt).getTime() <= sevenDaysAgo
            })
        },

        filteredQuestions: (state): Question[] => {
            let filtered = [...state.questions]

            if (state.searchQuery) {
                const query = state.searchQuery.toLowerCase()
                filtered = filtered.filter(q =>
                    q.title.toLowerCase().includes(query) ||
                    q.tags.some(t => t.toLowerCase().includes(query))
                )
            }

            if (state.filterDifficulty) {
                filtered = filtered.filter(q => q.difficulty === state.filterDifficulty)
            }

            if (state.filterStatus === 'solved') {
                filtered = filtered.filter(q => q.isSolved)
            } else if (state.filterStatus === 'unsolved') {
                filtered = filtered.filter(q => !q.isSolved)
            } else if (state.filterStatus === 'starred') {
                filtered = filtered.filter(q => q.isStarred)
            } else if (state.filterStatus === 'revision') {
                filtered = filtered.filter(q => q.isRevision)
            }

            return filtered
        },

        getTopicProgress: (state) => (topicId: string): Progress => {
            const topicQuestions = state.questions.filter(q => q.topicId === topicId)
            const solved = topicQuestions.filter(q => q.isSolved).length
            return { solved, total: topicQuestions.length }
        },

        overallProgress: (state): Progress => {
            const solved = state.questions.filter(q => q.isSolved).length
            return { solved, total: state.questions.length }
        }
    },

    actions: {
        addTopic(name: string) {
            const maxOrder = Math.max(...this.topics.map(t => t.order), -1)
            this.topics.push({
                id: `topic-${Date.now()}`,
                name,
                order: maxOrder + 1
            })
        },

        editTopic(id: string, name: string) {
            const topic = this.topics.find(t => t.id === id)
            if (topic) topic.name = name
        },

        deleteTopic(id: string) {
            this.subTopics = this.subTopics.filter(st => st.topicId !== id)
            this.questions = this.questions.filter(q => q.topicId !== id)
            this.topics = this.topics.filter(t => t.id !== id)
        },

        reorderTopics(newOrder: string[]) {
            newOrder.forEach((id, index) => {
                const topic = this.topics.find(t => t.id === id)
                if (topic) topic.order = index
            })
        },

        addSubTopic(topicId: string, name: string) {
            const topicSubTopics = this.subTopics.filter(st => st.topicId === topicId)
            const maxOrder = Math.max(...topicSubTopics.map(st => st.order), -1)
            this.subTopics.push({
                id: `subtopic-${Date.now()}`,
                topicId,
                name,
                order: maxOrder + 1
            })
        },

        editSubTopic(id: string, name: string) {
            const subTopic = this.subTopics.find(st => st.id === id)
            if (subTopic) subTopic.name = name
        },

        deleteSubTopic(id: string) {
            this.questions = this.questions.filter(q => q.subTopicId !== id)
            this.subTopics = this.subTopics.filter(st => st.id !== id)
        },

        reorderSubTopics(_topicId: string, newOrder: string[]) {
            newOrder.forEach((id, index) => {
                const subTopic = this.subTopics.find(st => st.id === id)
                if (subTopic) subTopic.order = index
            })
        },

        addQuestion(topicId: string, subTopicId: string | null, questionData: QuestionInput) {
            const topicQuestions = this.questions.filter(
                q => q.topicId === topicId && q.subTopicId === subTopicId
            )
            const maxOrder = Math.max(...topicQuestions.map(q => q.order), -1)

            this.questions.push({
                id: `q-${Date.now()}`,
                topicId,
                subTopicId,
                title: questionData.title,
                link: questionData.link || '',
                resource: questionData.resource || '',
                difficulty: questionData.difficulty || 'Medium',
                tags: questionData.tags || [],
                notes: '',
                isSolved: false,
                isRevision: false,
                isStarred: false,
                order: maxOrder + 1
            })
        },

        editQuestion(id: string, updates: QuestionUpdate) {
            const question = this.questions.find(q => q.id === id)
            if (question) {
                Object.assign(question, updates)
            }
        },

        deleteQuestion(id: string) {
            this.questions = this.questions.filter(q => q.id !== id)
        },

        toggleSolved(id: string) {
            const question = this.questions.find(q => q.id === id)
            if (question) {
                question.isSolved = !question.isSolved
                const todayKey = formatDateKey(new Date())

                if (question.isSolved) {
                    question.solvedAt = new Date().toISOString()
                    question.lastPracticedAt = new Date().toISOString()

                    const currentDayList = this.activityLog[todayKey] ? [...this.activityLog[todayKey]] : []
                    if (!currentDayList.includes(id)) {
                        this.activityLog = {
                            ...this.activityLog,
                            [todayKey]: [...currentDayList, id]
                        }
                    }
                } else {
                    if (this.activityLog[todayKey]) {
                        const updated = this.activityLog[todayKey].filter(qid => qid !== id)
                        this.activityLog = {
                            ...this.activityLog,
                            [todayKey]: updated
                        }
                    }
                }
            }
        },

        recordActivity(questionId: string, dateKey = formatDateKey(new Date())) {
            const currentDayList = this.activityLog[dateKey] ? [...this.activityLog[dateKey]] : []
            if (!currentDayList.includes(questionId)) {
                this.activityLog = {
                    ...this.activityLog,
                    [dateKey]: [...currentDayList, questionId]
                }
            }
        },

        toggleRevision(id: string) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.isRevision = !question.isRevision
        },

        toggleStarred(id: string) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.isStarred = !question.isStarred
        },

        updateNotes(id: string, notes: string) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.notes = notes
        },

        reorderQuestions(_topicId: string, _subTopicId: string | null, newOrder: string[]) {
            newOrder.forEach((id, index) => {
                const question = this.questions.find(q => q.id === id)
                if (question) question.order = index
            })
        },

        setSearchQuery(query: string) {
            this.searchQuery = query
        },

        setFilterDifficulty(difficulty: FilterDifficulty) {
            this.filterDifficulty = difficulty
        },

        setFilterStatus(status: FilterStatus) {
            this.filterStatus = status
        },

        resetData() {
            this.topics = [...seedData.topics]
            this.subTopics = [...seedData.subTopics]
            this.questions = [...seedData.questions]
            this.activityLog = {}
        },

        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark'
        },

        getExportPayload(): ExportPayload {
            return {
                version: 1,
                exportedAt: new Date().toISOString(),
                topics: JSON.parse(JSON.stringify(this.topics)),
                subTopics: JSON.parse(JSON.stringify(this.subTopics)),
                questions: JSON.parse(JSON.stringify(this.questions)),
                activityLog: JSON.parse(JSON.stringify(this.activityLog))
            }
        },

        getCSVExport(): string {
            const topicMap = new Map(this.topics.map(t => [t.id, t.name]))
            const subTopicMap = new Map(this.subTopics.map(st => [st.id, st.name]))

            const headers = [
                'Topic',
                'SubTopic',
                'Title',
                'Difficulty',
                'Link',
                'Resource',
                'Tags',
                'Solved',
                'Starred',
                'Revision',
                'Notes'
            ]

            const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`

            const rows = this.questions.map(q => [
                escapeCSV(topicMap.get(q.topicId) || ''),
                escapeCSV(q.subTopicId ? (subTopicMap.get(q.subTopicId) || '') : ''),
                escapeCSV(q.title),
                escapeCSV(q.difficulty),
                escapeCSV(q.link),
                escapeCSV(q.resource),
                escapeCSV(q.tags.join(', ')),
                q.isSolved ? 'Yes' : 'No',
                q.isStarred ? 'Yes' : 'No',
                q.isRevision ? 'Yes' : 'No',
                escapeCSV(q.notes)
            ].join(','))

            return [headers.join(','), ...rows].join('\n')
        },

        importData(payload: unknown, mode: ImportMode = 'replace'): { success: boolean; error?: string } {
            if (!payload || typeof payload !== 'object') {
                return { success: false, error: 'Invalid file format: payload must be an object' }
            }

            const data = payload as Partial<ExportPayload>

            if (!Array.isArray(data.topics) || !Array.isArray(data.questions)) {
                return { success: false, error: 'Invalid backup structure: topics and questions arrays are required' }
            }

            const importedTopics = (data.topics || []).filter(t => t && typeof t.id === 'string' && typeof t.name === 'string')
            const importedSubTopics = (data.subTopics || []).filter(st => st && typeof st.id === 'string' && typeof st.topicId === 'string' && typeof st.name === 'string')
            const importedQuestions = (data.questions || []).filter(q => q && typeof q.id === 'string' && typeof q.topicId === 'string' && typeof q.title === 'string')

            if (mode === 'replace') {
                this.topics = importedTopics
                this.subTopics = importedSubTopics
                this.questions = importedQuestions
            } else {
                for (const t of importedTopics) {
                    const idx = this.topics.findIndex(item => item.id === t.id)
                    if (idx >= 0) this.topics[idx] = t
                    else this.topics.push(t)
                }

                for (const st of importedSubTopics) {
                    const idx = this.subTopics.findIndex(item => item.id === st.id)
                    if (idx >= 0) this.subTopics[idx] = st
                    else this.subTopics.push(st)
                }

                for (const q of importedQuestions) {
                    const idx = this.questions.findIndex(item => item.id === q.id)
                    if (idx >= 0) this.questions[idx] = q
                    else this.questions.push(q)
                }
            }

            if (data.activityLog && typeof data.activityLog === 'object') {
                if (mode === 'replace') {
                    this.activityLog = data.activityLog as ActivityLog
                } else {
                    const mergedLog = { ...this.activityLog }
                    for (const [date, ids] of Object.entries(data.activityLog as ActivityLog)) {
                        const existing = mergedLog[date] || []
                        mergedLog[date] = Array.from(new Set([...existing, ...ids]))
                    }
                    this.activityLog = mergedLog
                }
            }

            return { success: true }
        },

        importCSV(csvText: string, mode: ImportMode = 'merge'): { success: boolean; error?: string; count?: number } {
            const { questions: parsedQuestions, error } = parseCSVToQuestions(csvText)
            if (error || parsedQuestions.length === 0) {
                return { success: false, error: error || 'No valid questions found in CSV file.' }
            }

            if (mode === 'replace') {
                this.topics = []
                this.subTopics = []
                this.questions = []
            }

            for (const pq of parsedQuestions) {
                let topic = this.topics.find(t => t.name.toLowerCase() === pq.topicName.toLowerCase())
                if (!topic) {
                    const maxOrder = Math.max(...this.topics.map(t => t.order), -1)
                    topic = {
                        id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        name: pq.topicName,
                        order: maxOrder + 1
                    }
                    this.topics.push(topic)
                }

                let subTopicId: string | null = null
                if (pq.subTopicName) {
                    let subTopic = this.subTopics.find(
                        st => st.topicId === topic!.id && st.name.toLowerCase() === pq.subTopicName!.toLowerCase()
                    )
                    if (!subTopic) {
                        const topicSubTopics = this.subTopics.filter(st => st.topicId === topic!.id)
                        const maxOrder = Math.max(...topicSubTopics.map(st => st.order), -1)
                        subTopic = {
                            id: `subtopic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                            topicId: topic.id,
                            name: pq.subTopicName,
                            order: maxOrder + 1
                        }
                        this.subTopics.push(subTopic)
                    }
                    subTopicId = subTopic.id
                }

                const existingQuestion = this.questions.find(
                    q => q.topicId === topic!.id && q.title.toLowerCase() === pq.title.toLowerCase()
                )

                if (existingQuestion) {
                    Object.assign(existingQuestion, {
                        subTopicId,
                        link: pq.link || existingQuestion.link,
                        resource: pq.resource || existingQuestion.resource,
                        difficulty: pq.difficulty,
                        tags: Array.from(new Set([...existingQuestion.tags, ...pq.tags])),
                        notes: pq.notes || existingQuestion.notes,
                        isSolved: pq.isSolved || existingQuestion.isSolved,
                        isStarred: pq.isStarred || existingQuestion.isStarred,
                        isRevision: pq.isRevision || existingQuestion.isRevision
                    })
                } else {
                    const topicQuestions = this.questions.filter(
                        q => q.topicId === topic!.id && q.subTopicId === subTopicId
                    )
                    const maxOrder = Math.max(...topicQuestions.map(q => q.order), -1)

                    this.questions.push({
                        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                        topicId: topic.id,
                        subTopicId,
                        title: pq.title,
                        link: pq.link,
                        resource: pq.resource,
                        difficulty: pq.difficulty,
                        tags: pq.tags,
                        notes: pq.notes,
                        isSolved: pq.isSolved,
                        isStarred: pq.isStarred,
                        isRevision: pq.isRevision,
                        order: maxOrder + 1
                    })
                }
            }

            return { success: true, count: parsedQuestions.length }
        }
    }
})
