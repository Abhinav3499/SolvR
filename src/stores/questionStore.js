import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { seedData } from '../data/seedData'

export const useQuestionStore = defineStore('questions', {
    state: () => ({
        topics: useLocalStorage('qs-topics', seedData.topics),
        subTopics: useLocalStorage('qs-subtopics', seedData.subTopics),
        questions: useLocalStorage('qs-questions', seedData.questions),
        theme: useLocalStorage('qs-theme', 'dark'),
        searchQuery: '',
        filterDifficulty: '',
        filterStatus: ''
    }),

    getters: {
        sortedTopics: (state) => {
            return [...state.topics].sort((a, b) => a.order - b.order)
        },

        getSubTopicsByTopic: (state) => (topicId) => {
            return state.subTopics
                .filter(st => st.topicId === topicId)
                .sort((a, b) => a.order - b.order)
        },

        getQuestionsByTopic: (state) => (topicId, subTopicId = null) => {
            return state.questions
                .filter(q => q.topicId === topicId && q.subTopicId === subTopicId)
                .sort((a, b) => a.order - b.order)
        },

        filteredQuestions: (state) => {
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

        getTopicProgress: (state) => (topicId) => {
            const topicQuestions = state.questions.filter(q => q.topicId === topicId)
            const solved = topicQuestions.filter(q => q.isSolved).length
            return { solved, total: topicQuestions.length }
        },

        overallProgress: (state) => {
            const solved = state.questions.filter(q => q.isSolved).length
            return { solved, total: state.questions.length }
        }
    },

    actions: {
        addTopic(name) {
            const maxOrder = Math.max(...this.topics.map(t => t.order), -1)
            this.topics.push({
                id: `topic-${Date.now()}`,
                name,
                order: maxOrder + 1
            })
        },

        editTopic(id, name) {
            const topic = this.topics.find(t => t.id === id)
            if (topic) topic.name = name
        },

        deleteTopic(id) {
            this.subTopics = this.subTopics.filter(st => st.topicId !== id)
            this.questions = this.questions.filter(q => q.topicId !== id)
            this.topics = this.topics.filter(t => t.id !== id)
        },

        reorderTopics(newOrder) {
            newOrder.forEach((id, index) => {
                const topic = this.topics.find(t => t.id === id)
                if (topic) topic.order = index
            })
        },

        addSubTopic(topicId, name) {
            const topicSubTopics = this.subTopics.filter(st => st.topicId === topicId)
            const maxOrder = Math.max(...topicSubTopics.map(st => st.order), -1)
            this.subTopics.push({
                id: `subtopic-${Date.now()}`,
                topicId,
                name,
                order: maxOrder + 1
            })
        },

        editSubTopic(id, name) {
            const subTopic = this.subTopics.find(st => st.id === id)
            if (subTopic) subTopic.name = name
        },

        deleteSubTopic(id) {
            this.questions = this.questions.filter(q => q.subTopicId !== id)
            this.subTopics = this.subTopics.filter(st => st.id !== id)
        },

        reorderSubTopics(topicId, newOrder) {
            newOrder.forEach((id, index) => {
                const subTopic = this.subTopics.find(st => st.id === id)
                if (subTopic) subTopic.order = index
            })
        },

        addQuestion(topicId, subTopicId, questionData) {
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

        editQuestion(id, updates) {
            const question = this.questions.find(q => q.id === id)
            if (question) {
                Object.assign(question, updates)
            }
        },

        deleteQuestion(id) {
            this.questions = this.questions.filter(q => q.id !== id)
        },

        toggleSolved(id) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.isSolved = !question.isSolved
        },

        toggleRevision(id) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.isRevision = !question.isRevision
        },

        toggleStarred(id) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.isStarred = !question.isStarred
        },

        updateNotes(id, notes) {
            const question = this.questions.find(q => q.id === id)
            if (question) question.notes = notes
        },

        reorderQuestions(topicId, subTopicId, newOrder) {
            newOrder.forEach((id, index) => {
                const question = this.questions.find(q => q.id === id)
                if (question) question.order = index
            })
        },

        setSearchQuery(query) {
            this.searchQuery = query
        },

        setFilterDifficulty(difficulty) {
            this.filterDifficulty = difficulty
        },

        setFilterStatus(status) {
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
