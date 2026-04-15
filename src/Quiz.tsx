import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabaseClient';
import {
    X, Plus, Trash2, Save, CheckCircle, XCircle, Zap,
    ArrowRight, ArrowLeft, GraduationCap, RotateCcw
} from 'lucide-react';

// --- Types ---

export interface QuizQuestion {
    question: string;
    choices: string[];
    correctIndex: number;
}

export interface Quiz {
    id: string;
    lesson_id: string;
    questions: QuizQuestion[];
    created_at?: string;
}

// --- Quiz Builder (Creator Side) ---

interface QuizBuilderProps {
    lessonId: string;
    lessonTitle: string;
    onClose: () => void;
}

export function QuizBuilder({ lessonId, lessonTitle, onClose }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quizId, setQuizId] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            const { data } = await supabase
                .from('quizzes')
                .select('*')
                .eq('lesson_id', lessonId)
                .maybeSingle();

            if (data) {
                setQuizId(data.id);
                setQuestions(data.questions || []);
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [lessonId]);

    const addQuestion = () => {
        setQuestions([...questions, {
            question: '',
            choices: ['', '', '', ''],
            correctIndex: 0
        }]);
    };

    const updateQuestion = (idx: number, field: string, value: string) => {
        const updated = [...questions];
        (updated[idx] as any)[field] = value;
        setQuestions(updated);
    };

    const updateChoice = (qIdx: number, cIdx: number, value: string) => {
        const updated = [...questions];
        updated[qIdx].choices[cIdx] = value;
        setQuestions(updated);
    };

    const setCorrect = (qIdx: number, cIdx: number) => {
        const updated = [...questions];
        updated[qIdx].correctIndex = cIdx;
        setQuestions(updated);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const addChoice = (qIdx: number) => {
        const updated = [...questions];
        if (updated[qIdx].choices.length < 6) {
            updated[qIdx].choices.push('');
            setQuestions(updated);
        }
    };

    const removeChoice = (qIdx: number, cIdx: number) => {
        const updated = [...questions];
        if (updated[qIdx].choices.length > 2) {
            updated[qIdx].choices.splice(cIdx, 1);
            if (updated[qIdx].correctIndex >= updated[qIdx].choices.length) {
                updated[qIdx].correctIndex = 0;
            }
            setQuestions(updated);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            id: quizId || Date.now().toString(),
            lesson_id: lessonId,
            questions
        };

        const { error } = await supabase.from('quizzes').upsert(payload);
        if (error) {
            console.error('Error saving quiz:', error);
        } else {
            setQuizId(payload.id);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" />
                <div className="bg-white rounded-[3rem] p-12 relative z-10 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-on-surface-variant font-bold">Loading quiz...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-on-surface/5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-on-surface">Quiz Builder</h3>
                        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-1">{lessonTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Questions List */}
                <div className="flex-grow overflow-y-auto p-8 space-y-8">
                    {questions.length === 0 && (
                        <div className="text-center py-16 text-on-surface-variant opacity-50">
                            <GraduationCap size={48} className="mx-auto mb-4" />
                            <p className="text-lg font-bold">No questions yet</p>
                            <p className="text-sm mt-1">Click "Add Question" below to start building your quiz.</p>
                        </div>
                    )}

                    {questions.map((q, qIdx) => (
                        <motion.div
                            key={qIdx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-surface-container-low rounded-3xl p-6 relative"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
                                    Q{qIdx + 1}
                                </span>
                                <button
                                    onClick={() => removeQuestion(qIdx)}
                                    className="p-1.5 rounded-xl text-on-surface-variant hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Question Text */}
                            <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                                className="w-full bg-white border-none rounded-2xl py-4 px-6 text-on-surface font-bold focus:ring-2 focus:ring-secondary/20 transition-all mb-4"
                                placeholder="Type your question here..."
                            />

                            {/* Choices */}
                            <div className="space-y-3">
                                {q.choices.map((choice, cIdx) => (
                                    <div key={cIdx} className="flex items-center gap-3">
                                        <button
                                            onClick={() => setCorrect(qIdx, cIdx)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${q.correctIndex === cIdx
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                : 'bg-white text-on-surface-variant hover:bg-green-50'
                                                }`}
                                            title="Mark as correct"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <input
                                            type="text"
                                            value={choice}
                                            onChange={(e) => updateChoice(qIdx, cIdx, e.target.value)}
                                            className={`flex-grow bg-white border-none rounded-xl py-3 px-5 text-on-surface text-sm focus:ring-2 focus:ring-secondary/20 transition-all ${q.correctIndex === cIdx ? 'ring-2 ring-green-500/30' : ''
                                                }`}
                                            placeholder={`Choice ${cIdx + 1}`}
                                        />
                                        {q.choices.length > 2 && (
                                            <button
                                                onClick={() => removeChoice(qIdx, cIdx)}
                                                className="p-1.5 rounded-lg text-on-surface-variant/30 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {q.choices.length < 6 && (
                                <button
                                    onClick={() => addChoice(qIdx)}
                                    className="mt-3 text-xs text-secondary font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
                                >
                                    <Plus size={14} /> Add Choice
                                </button>
                            )}
                        </motion.div>
                    ))}

                    {/* Add Question Button */}
                    <button
                        onClick={addQuestion}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-on-surface/10 text-on-surface-variant font-bold flex items-center justify-center gap-2 hover:border-secondary hover:text-secondary transition-all"
                    >
                        <Plus size={20} />
                        Add Question
                    </button>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-on-surface/5 flex gap-4 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// --- Quiz Player (Student Side) ---

interface QuizPlayerProps {
    lessonId: string;
    lessonTitle: string;
    onClose: () => void;
}

export function QuizPlayer({ lessonId, lessonTitle, onClose }: QuizPlayerProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            const { data } = await supabase
                .from('quizzes')
                .select('*')
                .eq('lesson_id', lessonId)
                .maybeSingle();

            if (data && data.questions && data.questions.length > 0) {
                setQuiz(data);
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [lessonId]);

    const handleAnswer = (choiceIdx: number) => {
        if (isRevealed) return;
        setSelectedAnswer(choiceIdx);
    };

    const confirmAnswer = () => {
        if (selectedAnswer === null || isRevealed) return;
        setIsRevealed(true);
        if (quiz && selectedAnswer === quiz.questions[currentQ].correctIndex) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (!quiz) return;
        if (currentQ + 1 >= quiz.questions.length) {
            setIsFinished(true);
        } else {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
            setIsRevealed(false);
        }
    };

    const restart = () => {
        setCurrentQ(0);
        setSelectedAnswer(null);
        setIsRevealed(false);
        setScore(0);
        setIsFinished(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
                <div className="bg-white rounded-[3rem] p-12 relative z-10 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-on-surface-variant font-bold">Loading quiz...</p>
                </div>
            </div>
        );
    }

    // No quiz found
    if (!quiz) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] p-12 relative z-10 text-center max-w-md w-full"
                >
                    <GraduationCap size={48} className="mx-auto mb-4 text-on-surface-variant opacity-30" />
                    <h3 className="text-2xl font-black text-on-surface mb-2">No Quiz Yet</h3>
                    <p className="text-on-surface-variant mb-8">The creator hasn't added a quiz for this lesson yet. Check back later!</p>
                    <button
                        onClick={onClose}
                        className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                    >
                        Go Back
                    </button>
                </motion.div>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const progress = isFinished ? 100 : ((currentQ) / totalQuestions) * 100;

    // Finished state
    if (isFinished) {
        const percentage = Math.round((score / totalQuestions) * 100);
        const isPassing = percentage >= 70;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] p-12 relative z-10 text-center max-w-lg w-full"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${isPassing ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                        {isPassing ? (
                            <CheckCircle size={48} className="text-green-500" />
                        ) : (
                            <XCircle size={48} className="text-red-500" />
                        )}
                    </motion.div>

                    <h3 className="text-3xl font-black text-on-surface mb-2">
                        {isPassing ? 'Excellent!' : 'Keep Practicing!'}
                    </h3>
                    <p className="text-on-surface-variant mb-2">{lessonTitle}</p>

                    <div className="my-8">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`text-6xl font-black ${isPassing ? 'text-green-500' : 'text-red-500'}`}
                        >
                            {percentage}%
                        </motion.span>
                        <p className="text-on-surface-variant mt-2 font-medium">{score} out of {totalQuestions} correct</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={restart}
                            className="flex-1 bg-surface-container-low text-on-surface-variant py-4 rounded-2xl font-bold hover:bg-on-surface/5 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            Retry
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20"
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Active question
    const q = quiz.questions[currentQ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full h-full md:h-auto md:max-w-2xl md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:max-h-[90vh]"
            >
                {/* Header + Progress */}
                <div className="p-6 pb-4 shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                Question {currentQ + 1} of {totalQuestions}
                            </span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors text-on-surface-variant">
                            <X size={20} />
                        </button>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-secondary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>

                {/* Question */}
                <div className="flex-grow overflow-y-auto px-8 pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQ}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h3 className="text-2xl font-bold text-on-surface mb-8 leading-snug">
                                {q.question}
                            </h3>

                            <div className="space-y-3">
                                {q.choices.map((choice, cIdx) => {
                                    let btnClass = 'bg-surface-container-low hover:bg-secondary/5 border-2 border-transparent';

                                    if (isRevealed) {
                                        if (cIdx === q.correctIndex) {
                                            btnClass = 'bg-green-50 border-2 border-green-500 text-green-700';
                                        } else if (cIdx === selectedAnswer && cIdx !== q.correctIndex) {
                                            btnClass = 'bg-red-50 border-2 border-red-500 text-red-700';
                                        } else {
                                            btnClass = 'bg-surface-container-low border-2 border-transparent opacity-50';
                                        }
                                    } else if (cIdx === selectedAnswer) {
                                        btnClass = 'bg-secondary/10 border-2 border-secondary';
                                    }

                                    return (
                                        <motion.button
                                            key={cIdx}
                                            whileHover={!isRevealed ? { scale: 1.01 } : {}}
                                            whileTap={!isRevealed ? { scale: 0.99 } : {}}
                                            onClick={() => handleAnswer(cIdx)}
                                            className={`w-full text-left px-6 py-4 rounded-2xl font-medium transition-all flex items-center gap-4 ${btnClass}`}
                                            disabled={isRevealed}
                                        >
                                            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                                {String.fromCharCode(65 + cIdx)}
                                            </span>
                                            <span className="flex-grow">{choice}</span>
                                            {isRevealed && cIdx === q.correctIndex && (
                                                <CheckCircle size={20} className="text-green-500 shrink-0" />
                                            )}
                                            {isRevealed && cIdx === selectedAnswer && cIdx !== q.correctIndex && (
                                                <XCircle size={20} className="text-red-500 shrink-0" />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {(selectedAnswer !== null || isRevealed) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 border-t border-on-surface/5 shrink-0"
                    >
                        {!isRevealed ? (
                            <button
                                onClick={confirmAnswer}
                                className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                            >
                                Confirm Answer
                                <Zap size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="w-full bg-secondary text-white py-4 rounded-2xl font-bold hover:bg-secondary-dim transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                            >
                                {currentQ + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
                                <ArrowRight size={20} />
                            </button>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
