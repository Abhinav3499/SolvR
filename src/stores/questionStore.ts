import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { seedData } from '../data/seedData'
import type {
    Topic,
    SubTopic,
    Question,
    QuestionInput,
    QuestionUpdate,
    FilterDifficulty,
    FilterStatus,
    Theme,
    Progress
} from '../types'

export const useQuestionStore = defineStore('questions', {
    state: () => ({
        topics: useLocalStorage<Topic[]>('qs-topics', seedData.topics),
        subTopics: useLocalStorage<SubTopic[]>('qs-subtopics', seedData.subTopics),
        questions: useLocalStorage<Question[]>('qs-questions', seedData.questions),
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
            if (question) question.isSolved = !question.isSolved
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
        },

        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark'
        }
    }
})
