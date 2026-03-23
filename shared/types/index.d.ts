export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";
export type Difficulty = "easy" | "medium" | "hard";
export interface QuestionType {
    type: string;
    count: number;
    marks: number;
}
export interface CreateAssignmentPayload {
    title: string;
    dueDate: string;
    questionTypes: QuestionType[];
    instructions: string;
    subject?: string;
    className?: string;
}
export interface AssignmentDocument {
    _id: string;
    title: string;
    dueDate: string;
    questionTypes: QuestionType[];
    instructions: string;
    subject: string;
    className: string;
    status: AssignmentStatus;
    resultId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Question {
    text: string;
    difficulty: Difficulty;
    marks: number;
}
export interface Section {
    title: string;
    questionType: string;
    instruction: string;
    questions: Question[];
    answerKey?: string[];
}
export interface ResultDocument {
    _id: string;
    assignmentId: string;
    sections: Section[];
    createdAt: string;
}
export interface AIGeneratedPaper {
    sections: Array<{
        title: string;
        questionType: string;
        instruction: string;
        questions: Array<{
            text: string;
            difficulty: Difficulty;
            marks: number;
        }>;
        answerKey?: string[];
    }>;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface AssignmentCompletedPayload {
    assignmentId: string;
    resultId: string;
    status: "completed" | "failed";
    error?: string;
}
export interface StatusUpdatePayload {
    assignmentId: string;
    status: AssignmentStatus;
    resultId?: string;
}
export type WSEventMap = {
    "assignment:completed": AssignmentCompletedPayload;
    "assignment:status_update": StatusUpdatePayload;
};
export interface GeneratePaperJobData {
    assignmentId: string;
}
