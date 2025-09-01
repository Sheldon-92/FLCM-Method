/**
 * Test Setup Configuration
 * Global setup for Jest testing environment
 */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeWithinTimeRange(min: number, max: number): R;
        }
    }
}
export declare const createMockDate: (dateString: string) => import("jest-mock").SpiedClass<DateConstructor>;
export declare const createMockTimers: () => {
    advanceTime: (ms: number) => void;
    runAllTimers: () => void;
    restore: () => import("@jest/environment").Jest;
};
export declare const waitFor: (ms: number) => Promise<void>;
export declare const mockAsyncMethod: <T>(obj: any, method: string, implementation?: ((...args: any[]) => Promise<T>) | undefined) => import("jest-mock").SpiedClass<any>;
