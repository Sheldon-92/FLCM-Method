export interface FLCMUIConfig {
    id: string;
    name: string;
    version: string;
    description?: string;
    theme: UITheme;
    layout: UILayout;
    components: UIComponentRegistry;
    routes: UIRoute[];
    navigation: UINavigation;
    authentication: UIAuthentication;
    localization: UILocalization;
    accessibility: UIAccessibility;
    performance: UIPerformance;
    analytics: UIAnalytics;
    errorHandling: UIErrorHandling;
    features: UIFeatures;
    metadata?: Record<string, any>;
}
export interface UITheme {
    id: string;
    name: string;
    mode: 'light' | 'dark' | 'auto';
    colors: UIColorPalette;
    typography: UITypography;
    spacing: UISpacing;
    breakpoints: UIBreakpoints;
    animations: UIAnimations;
    shadows: UIShadows;
    borders: UIBorders;
    customProperties?: Record<string, any>;
}
export interface UIColorPalette {
    primary: ColorScale;
    secondary: ColorScale;
    tertiary?: ColorScale;
    neutral: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
    background: {
        default: string;
        paper: string;
        overlay: string;
        elevated: string;
    };
    text: {
        primary: string;
        secondary: string;
        disabled: string;
        inverse: string;
    };
    divider: string;
    custom?: Record<string, string>;
}
export interface ColorScale {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    main: string;
    light: string;
    dark: string;
    contrastText: string;
}
export interface UITypography {
    fontFamilies: {
        heading: string;
        body: string;
        monospace: string;
        custom?: Record<string, string>;
    };
    fontSizes: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        custom?: Record<string, string>;
    };
    fontWeights: {
        thin: number;
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
        black: number;
    };
    lineHeights: {
        none: number;
        tight: number;
        snug: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
    letterSpacing: {
        tighter: string;
        tight: string;
        normal: string;
        wide: string;
        wider: string;
        widest: string;
    };
}
export interface UISpacing {
    unit: number;
    scale: {
        '0': string;
        '1': string;
        '2': string;
        '3': string;
        '4': string;
        '5': string;
        '6': string;
        '8': string;
        '10': string;
        '12': string;
        '16': string;
        '20': string;
        '24': string;
        '32': string;
        '40': string;
        '48': string;
        '56': string;
        '64': string;
    };
    custom?: Record<string, string>;
}
export interface UIBreakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    custom?: Record<string, number>;
}
export interface UIAnimations {
    durations: {
        instant: number;
        fast: number;
        normal: number;
        slow: number;
        slower: number;
    };
    easings: {
        linear: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
        bounce: string;
        custom?: Record<string, string>;
    };
    transitions: Record<string, UITransition>;
}
export interface UITransition {
    property: string;
    duration: number;
    easing: string;
    delay?: number;
}
export interface UIShadows {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    custom?: Record<string, string>;
}
export interface UIBorders {
    widths: {
        none: string;
        thin: string;
        medium: string;
        thick: string;
    };
    radii: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
        full: string;
    };
    styles: {
        solid: string;
        dashed: string;
        dotted: string;
        double: string;
        none: string;
    };
}
export interface UILayout {
    type: 'fixed' | 'fluid' | 'responsive' | 'adaptive';
    container: {
        maxWidth: string;
        padding: string;
        centered: boolean;
    };
    grid: {
        columns: number;
        gap: string;
        responsive: Record<string, GridConfig>;
    };
    regions: {
        header: UIRegion;
        sidebar?: UIRegion;
        main: UIRegion;
        footer: UIRegion;
        custom?: Record<string, UIRegion>;
    };
}
export interface GridConfig {
    columns: number;
    gap: string;
    areas?: string[][];
}
export interface UIRegion {
    id: string;
    type: 'static' | 'sticky' | 'fixed' | 'absolute';
    visible: boolean;
    height?: string;
    width?: string;
    position?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    zIndex?: number;
    components?: string[];
}
export interface UIComponentRegistry {
    components: Record<string, UIComponent>;
    templates: Record<string, UIComponentTemplate>;
    compositions: Record<string, UIComposition>;
}
export interface UIComponent {
    id: string;
    name: string;
    type: UIComponentType;
    version: string;
    description?: string;
    props: UIComponentProps;
    state?: UIComponentState;
    events: UIComponentEvent[];
    slots?: UIComponentSlot[];
    styles?: UIComponentStyles;
    behaviors?: UIComponentBehavior[];
    accessibility?: UIComponentAccessibility;
    validation?: UIComponentValidation;
    documentation?: string;
    examples?: UIComponentExample[];
    dependencies?: string[];
    tags?: string[];
}
export type UIComponentType = 'button' | 'input' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'switch' | 'slider' | 'datepicker' | 'timepicker' | 'colorpicker' | 'filepicker' | 'form' | 'table' | 'list' | 'grid' | 'card' | 'modal' | 'drawer' | 'tooltip' | 'popover' | 'alert' | 'toast' | 'badge' | 'chip' | 'avatar' | 'icon' | 'image' | 'video' | 'audio' | 'chart' | 'map' | 'editor' | 'calendar' | 'tree' | 'tabs' | 'accordion' | 'stepper' | 'breadcrumb' | 'pagination' | 'progress' | 'spinner' | 'skeleton' | 'divider' | 'container' | 'layout' | 'custom';
export interface UIComponentProps {
    required: Record<string, UIProp>;
    optional?: Record<string, UIProp>;
    advanced?: Record<string, UIProp>;
}
export interface UIProp {
    type: UIPropType;
    description?: string;
    default?: any;
    enum?: any[];
    pattern?: string;
    min?: number;
    max?: number;
    required?: boolean;
    deprecated?: boolean;
    experimental?: boolean;
}
export type UIPropType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'element' | 'node' | 'any';
export interface UIComponentState {
    initial: Record<string, any>;
    reducers?: Record<string, StateReducer>;
    effects?: Record<string, StateEffect>;
    computed?: Record<string, ComputedValue>;
    persist?: string[];
}
export interface StateReducer {
    type: string;
    handler: string;
}
export interface StateEffect {
    trigger: string[];
    handler: string;
    debounce?: number;
    throttle?: number;
}
export interface ComputedValue {
    dependencies: string[];
    handler: string;
    memoize?: boolean;
}
export interface UIComponentEvent {
    name: string;
    description?: string;
    payload?: Record<string, UIProp>;
    bubbles?: boolean;
    cancelable?: boolean;
}
export interface UIComponentSlot {
    name: string;
    description?: string;
    required?: boolean;
    multiple?: boolean;
    accepts?: string[];
}
export interface UIComponentStyles {
    base: string;
    variants?: Record<string, Record<string, string>>;
    responsive?: Record<string, string>;
    states?: Record<string, string>;
    parts?: Record<string, string>;
}
export interface UIComponentBehavior {
    trigger: 'mount' | 'unmount' | 'update' | 'focus' | 'blur' | 'hover' | 'click' | string;
    action: string;
    conditions?: UICondition[];
}
export interface UICondition {
    type: 'state' | 'prop' | 'context' | 'media' | 'custom';
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
    value: any;
}
export interface UIComponentAccessibility {
    role: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    ariaLabelledBy?: string;
    ariaLive?: 'off' | 'polite' | 'assertive';
    tabIndex?: number;
    keyboard?: UIKeyboardSupport;
    screenReader?: UIScreenReaderSupport;
}
export interface UIKeyboardSupport {
    shortcuts: Record<string, string>;
    navigation: 'arrow' | 'tab' | 'both';
    activation: 'enter' | 'space' | 'both';
}
export interface UIScreenReaderSupport {
    announcements: Record<string, string>;
    descriptions: Record<string, string>;
    instructions?: string;
}
export interface UIComponentValidation {
    rules: UIValidationRule[];
    messages: Record<string, string>;
    validateOn: 'change' | 'blur' | 'submit';
    debounce?: number;
}
export interface UIValidationRule {
    type: 'required' | 'pattern' | 'min' | 'max' | 'email' | 'url' | 'custom';
    value?: any;
    message?: string;
    condition?: UICondition;
}
export interface UIComponentExample {
    title: string;
    description?: string;
    code: string;
    language: 'jsx' | 'tsx' | 'vue' | 'svelte' | 'html';
    preview?: boolean;
    playground?: boolean;
}
export interface UIComponentTemplate {
    id: string;
    name: string;
    description?: string;
    components: string[];
    layout: string;
    props?: Record<string, any>;
    data?: Record<string, any>;
}
export interface UIComposition {
    id: string;
    name: string;
    description?: string;
    type: 'page' | 'section' | 'widget' | 'pattern';
    template: string;
    overrides?: Record<string, any>;
    data?: Record<string, any>;
}
export interface UIRoute {
    id: string;
    path: string;
    name: string;
    component: string;
    exact?: boolean;
    guards?: UIRouteGuard[];
    meta?: UIRouteMeta;
    children?: UIRoute[];
    redirect?: string;
    alias?: string[];
}
export interface UIRouteGuard {
    type: 'auth' | 'role' | 'permission' | 'custom';
    value?: any;
    redirectTo?: string;
    message?: string;
}
export interface UIRouteMeta {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    breadcrumb?: string;
    layout?: string;
    transition?: string;
    cache?: boolean;
    preload?: boolean;
}
export interface UINavigation {
    primary: UINavigationMenu;
    secondary?: UINavigationMenu;
    breadcrumbs?: UIBreadcrumbConfig;
    sitemap?: UISitemapConfig;
}
export interface UINavigationMenu {
    items: UINavigationItem[];
    position: 'top' | 'left' | 'right' | 'bottom';
    type: 'horizontal' | 'vertical' | 'dropdown' | 'mega';
    sticky?: boolean;
    collapsible?: boolean;
    mobileBreakpoint?: string;
}
export interface UINavigationItem {
    id: string;
    label: string;
    path?: string;
    icon?: string;
    badge?: string;
    children?: UINavigationItem[];
    external?: boolean;
    target?: '_self' | '_blank' | '_parent' | '_top';
    disabled?: boolean;
    hidden?: boolean;
    permissions?: string[];
}
export interface UIBreadcrumbConfig {
    enabled: boolean;
    separator: string;
    homeLabel: string;
    maxItems?: number;
    truncate?: boolean;
}
export interface UISitemapConfig {
    enabled: boolean;
    path: string;
    exclude?: string[];
    priority?: Record<string, number>;
    changefreq?: Record<string, string>;
}
export interface UIAuthentication {
    enabled: boolean;
    provider: UIAuthProvider;
    endpoints: UIAuthEndpoints;
    storage: UIAuthStorage;
    redirects: UIAuthRedirects;
    features: UIAuthFeatures;
}
export interface UIAuthProvider {
    type: 'jwt' | 'oauth' | 'saml' | 'custom';
    config: Record<string, any>;
}
export interface UIAuthEndpoints {
    login: string;
    logout: string;
    refresh?: string;
    user?: string;
    register?: string;
    forgotPassword?: string;
    resetPassword?: string;
    verifyEmail?: string;
}
export interface UIAuthStorage {
    type: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
    key: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    httpOnly?: boolean;
}
export interface UIAuthRedirects {
    login: string;
    logout: string;
    unauthorized: string;
    afterLogin?: string;
    afterLogout?: string;
}
export interface UIAuthFeatures {
    rememberMe?: boolean;
    socialLogin?: string[];
    twoFactor?: boolean;
    biometric?: boolean;
    sessionTimeout?: number;
    refreshToken?: boolean;
}
export interface UILocalization {
    enabled: boolean;
    defaultLocale: string;
    supportedLocales: UILocale[];
    fallbackLocale: string;
    detection: UILocaleDetection;
    storage: UILocaleStorage;
    resources: UILocaleResources;
}
export interface UILocale {
    code: string;
    name: string;
    nativeName: string;
    direction: 'ltr' | 'rtl';
    dateFormat?: string;
    timeFormat?: string;
    numberFormat?: string;
    currency?: string;
}
export interface UILocaleDetection {
    order: ('querystring' | 'cookie' | 'localStorage' | 'navigator' | 'htmlTag')[];
    caches: string[];
}
export interface UILocaleStorage {
    type: 'localStorage' | 'cookie';
    key: string;
}
export interface UILocaleResources {
    type: 'inline' | 'remote' | 'lazy';
    path?: string;
    namespaces?: string[];
    cache?: boolean;
}
export interface UIAccessibility {
    enabled: boolean;
    features: UIAccessibilityFeatures;
    testing: UIAccessibilityTesting;
    compliance: UIAccessibilityCompliance;
}
export interface UIAccessibilityFeatures {
    highContrast: boolean;
    fontSize: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
    keyboard: boolean;
    focusIndicator: boolean;
    skipLinks: boolean;
    landmarks: boolean;
    announcements: boolean;
}
export interface UIAccessibilityTesting {
    automated: boolean;
    tools: string[];
    schedule?: string;
    reports?: string;
}
export interface UIAccessibilityCompliance {
    standard: 'WCAG21' | 'WCAG22' | 'Section508' | 'ADA';
    level: 'A' | 'AA' | 'AAA';
    certification?: string;
}
export interface UIPerformance {
    optimization: UIOptimization;
    monitoring: UIPerformanceMonitoring;
    budgets: UIPerformanceBudgets;
    caching: UICaching;
}
export interface UIOptimization {
    bundling: UIBundling;
    lazy: UILazyLoading;
    preloading: UIPreloading;
    compression: UICompression;
    images: UIImageOptimization;
}
export interface UIBundling {
    splitting: boolean;
    chunks: 'vendor' | 'common' | 'route' | 'component';
    minify: boolean;
    treeshake: boolean;
    sourcemaps: boolean;
}
export interface UILazyLoading {
    routes: boolean;
    components: boolean;
    images: boolean;
    threshold?: number;
}
export interface UIPreloading {
    strategy: 'prefetch' | 'preload' | 'preconnect' | 'dns-prefetch';
    resources: string[];
}
export interface UICompression {
    enabled: boolean;
    algorithms: ('gzip' | 'brotli' | 'deflate')[];
    threshold?: number;
}
export interface UIImageOptimization {
    formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
    sizes: number[];
    quality: number;
    lazy: boolean;
    placeholder: 'blur' | 'skeleton' | 'color';
}
export interface UIPerformanceMonitoring {
    enabled: boolean;
    metrics: UIMetrics[];
    reporting: UIReporting;
    alerts: UIPerformanceAlert[];
}
export interface UIMetrics {
    name: string;
    type: 'navigation' | 'resource' | 'paint' | 'layout' | 'custom';
    threshold?: number;
}
export interface UIReporting {
    endpoint: string;
    interval: number;
    batch: boolean;
    sampling?: number;
}
export interface UIPerformanceAlert {
    metric: string;
    threshold: number;
    action: 'log' | 'report' | 'notify';
}
export interface UIPerformanceBudgets {
    bundles: Record<string, number>;
    resources: Record<string, number>;
    metrics: Record<string, number>;
}
export interface UICaching {
    strategy: 'networkFirst' | 'cacheFirst' | 'staleWhileRevalidate';
    duration: number;
    storage: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
    exclude?: string[];
}
export interface UIAnalytics {
    enabled: boolean;
    providers: UIAnalyticsProvider[];
    events: UIAnalyticsEvent[];
    privacy: UIPrivacySettings;
}
export interface UIAnalyticsProvider {
    name: string;
    type: 'ga' | 'gtm' | 'segment' | 'mixpanel' | 'custom';
    config: Record<string, any>;
}
export interface UIAnalyticsEvent {
    name: string;
    trigger: string;
    data?: Record<string, any>;
    conditions?: UICondition[];
}
export interface UIPrivacySettings {
    cookieConsent: boolean;
    anonymizeIp: boolean;
    doNotTrack: boolean;
    dataRetention?: number;
}
export interface UIErrorHandling {
    boundaries: UIErrorBoundary[];
    handlers: UIErrorHandler[];
    reporting: UIErrorReporting;
    recovery: UIErrorRecovery;
}
export interface UIErrorBoundary {
    id: string;
    scope: string;
    fallback: string;
    retry?: boolean;
}
export interface UIErrorHandler {
    type: 'network' | 'runtime' | 'validation' | 'business';
    handler: string;
    notify?: boolean;
}
export interface UIErrorReporting {
    enabled: boolean;
    endpoint: string;
    sampleRate?: number;
    ignorePatterns?: string[];
}
export interface UIErrorRecovery {
    strategies: UIRecoveryStrategy[];
    maxRetries: number;
    backoff: 'linear' | 'exponential';
}
export interface UIRecoveryStrategy {
    error: string;
    action: 'retry' | 'fallback' | 'refresh' | 'redirect';
    target?: string;
}
export interface UIFeatures {
    search: UISearchFeature;
    notifications: UINotificationFeature;
    feedback: UIFeedbackFeature;
    help: UIHelpFeature;
    experiments: UIExperiments;
}
export interface UISearchFeature {
    enabled: boolean;
    provider: 'algolia' | 'elasticsearch' | 'custom';
    config: Record<string, any>;
    ui: {
        instant: boolean;
        suggestions: boolean;
        history: boolean;
        filters?: boolean;
    };
}
export interface UINotificationFeature {
    enabled: boolean;
    channels: ('push' | 'email' | 'sms' | 'inapp')[];
    preferences: boolean;
    realtime: boolean;
    storage?: string;
}
export interface UIFeedbackFeature {
    enabled: boolean;
    types: ('bug' | 'feature' | 'improvement' | 'other')[];
    widget: boolean;
    screenshot: boolean;
    rating?: boolean;
}
export interface UIHelpFeature {
    enabled: boolean;
    resources: UIHelpResource[];
    widget?: UIHelpWidget;
}
export interface UIHelpResource {
    type: 'docs' | 'video' | 'tour' | 'chat' | 'faq';
    url?: string;
    config?: Record<string, any>;
}
export interface UIHelpWidget {
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    trigger: 'click' | 'hover';
    style?: Record<string, any>;
}
export interface UIExperiments {
    enabled: boolean;
    provider: 'optimizely' | 'launchdarkly' | 'custom';
    config: Record<string, any>;
    features: Record<string, UIFeatureFlag>;
}
export interface UIFeatureFlag {
    enabled: boolean;
    variant?: string;
    rollout?: number;
    conditions?: UICondition[];
}
export interface UIFramework {
    name: 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'qwik';
    version: string;
    config: UIFrameworkConfig;
    plugins: UIFrameworkPlugin[];
    build: UIBuildConfig;
}
export interface UIFrameworkConfig {
    ssr: boolean;
    hydration: 'full' | 'partial' | 'progressive';
    routing: 'client' | 'server' | 'hybrid';
    stateManagement?: string;
    styling?: string;
    testing?: string;
}
export interface UIFrameworkPlugin {
    name: string;
    version: string;
    config?: Record<string, any>;
}
export interface UIBuildConfig {
    tool: 'webpack' | 'vite' | 'rollup' | 'esbuild' | 'parcel';
    entry: string;
    output: string;
    publicPath?: string;
    env?: Record<string, string>;
    alias?: Record<string, string>;
    externals?: string[];
}
export interface UIRenderingEngine {
    type: 'client' | 'server' | 'static' | 'hybrid';
    strategy: UIRenderStrategy;
    optimization: UIRenderOptimization;
    hydration?: UIHydrationConfig;
}
export interface UIRenderStrategy {
    mode: 'sync' | 'async' | 'concurrent' | 'streaming';
    priority: Record<string, number>;
    fallback?: string;
}
export interface UIRenderOptimization {
    memoization: boolean;
    virtualization: boolean;
    debouncing: number;
    throttling: number;
    batchUpdates: boolean;
}
export interface UIHydrationConfig {
    strategy: 'full' | 'partial' | 'progressive' | 'islands';
    priority: string[];
    triggers?: ('idle' | 'visible' | 'interaction')[];
}
export interface UIStateManager {
    type: 'redux' | 'mobx' | 'zustand' | 'valtio' | 'jotai' | 'recoil' | 'context';
    config: UIStateConfig;
    stores: UIStore[];
    middleware?: UIStateMiddleware[];
    devtools?: boolean;
}
export interface UIStateConfig {
    immutable: boolean;
    persist?: UIStatePersist;
    sync?: UIStateSync;
    time?: UITimeTravel;
}
export interface UIStatePersist {
    enabled: boolean;
    storage: 'localStorage' | 'sessionStorage' | 'indexedDB';
    key: string;
    whitelist?: string[];
    blacklist?: string[];
    migrate?: string;
}
export interface UIStateSync {
    enabled: boolean;
    channel: 'broadcast' | 'websocket' | 'webrtc';
    url?: string;
    room?: string;
}
export interface UITimeTravel {
    enabled: boolean;
    limit: number;
    actions?: string[];
}
export interface UIStore {
    name: string;
    state: Record<string, any>;
    actions: Record<string, string>;
    getters?: Record<string, string>;
    subscriptions?: UISubscription[];
}
export interface UISubscription {
    path: string;
    handler: string;
    immediate?: boolean;
}
export interface UIStateMiddleware {
    name: string;
    type: 'logger' | 'thunk' | 'saga' | 'observable' | 'custom';
    config?: Record<string, any>;
}
export interface UIDesignSystem {
    name: string;
    version: string;
    tokens: UIDesignTokens;
    components: UIComponentLibrary;
    patterns: UIDesignPattern[];
    guidelines: UIDesignGuidelines;
}
export interface UIDesignTokens {
    colors: Record<string, any>;
    typography: Record<string, any>;
    spacing: Record<string, any>;
    sizing: Record<string, any>;
    elevation: Record<string, any>;
    motion: Record<string, any>;
    breakpoints: Record<string, any>;
}
export interface UIComponentLibrary {
    name: string;
    version: string;
    components: string[];
    themes: string[];
    customization?: UICustomization;
}
export interface UICustomization {
    cssVariables: boolean;
    themeProvider: boolean;
    styled: boolean;
    cssInJs?: string;
}
export interface UIDesignPattern {
    name: string;
    category: string;
    description: string;
    components: string[];
    example?: string;
    guidelines?: string;
}
export interface UIDesignGuidelines {
    principles: string[];
    accessibility: string;
    responsive: string;
    animation: string;
    interaction: string;
    content: string;
}
export interface UITesting {
    unit: UITestConfig;
    integration: UITestConfig;
    e2e: UITestConfig;
    visual: UIVisualTestConfig;
    accessibility: UIAccessibilityTestConfig;
    performance: UIPerformanceTestConfig;
}
export interface UITestConfig {
    enabled: boolean;
    framework: string;
    config: Record<string, any>;
    coverage?: UICoverageConfig;
}
export interface UICoverageConfig {
    enabled: boolean;
    thresholds: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
    };
    reporters: string[];
}
export interface UIVisualTestConfig extends UITestConfig {
    tool: 'percy' | 'chromatic' | 'applitools' | 'custom';
    baseline?: string;
    viewports?: number[];
    browsers?: string[];
}
export interface UIAccessibilityTestConfig extends UITestConfig {
    tool: 'axe' | 'pa11y' | 'lighthouse' | 'custom';
    rules?: string[];
    level?: 'A' | 'AA' | 'AAA';
}
export interface UIPerformanceTestConfig extends UITestConfig {
    tool: 'lighthouse' | 'webpagetest' | 'custom';
    metrics: string[];
    budgets: Record<string, number>;
}
export interface UIDeployment {
    environments: UIEnvironment[];
    pipeline: UIDeploymentPipeline;
    hosting: UIHostingConfig;
    cdn?: UICDNConfig;
    monitoring?: UIMonitoringConfig;
}
export interface UIEnvironment {
    name: string;
    url: string;
    branch?: string;
    variables?: Record<string, string>;
    features?: string[];
}
export interface UIDeploymentPipeline {
    stages: UIDeploymentStage[];
    triggers: UIDeploymentTrigger[];
    notifications?: UIDeploymentNotification[];
}
export interface UIDeploymentStage {
    name: string;
    steps: string[];
    environment?: string;
    approval?: boolean;
}
export interface UIDeploymentTrigger {
    type: 'push' | 'pr' | 'tag' | 'schedule' | 'manual';
    branch?: string;
    schedule?: string;
}
export interface UIDeploymentNotification {
    channel: 'email' | 'slack' | 'teams' | 'webhook';
    events: string[];
    recipients?: string[];
}
export interface UIHostingConfig {
    provider: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'custom';
    region?: string;
    scaling?: UIScalingConfig;
}
export interface UIScalingConfig {
    min: number;
    max: number;
    metric: 'cpu' | 'memory' | 'requests';
    target: number;
}
export interface UICDNConfig {
    enabled: boolean;
    provider: 'cloudflare' | 'fastly' | 'akamai' | 'custom';
    zones?: string[];
    cache?: UICDNCacheConfig;
}
export interface UICDNCacheConfig {
    ttl: number;
    purge?: 'auto' | 'manual';
    strategy?: string;
}
export interface UIMonitoringConfig {
    analytics: UIAnalyticsConfig;
    errors: UIErrorMonitoringConfig;
    performance: UIPerformanceMonitoringConfig;
    uptime?: UIUptimeConfig;
}
export interface UIAnalyticsConfig {
    provider: string;
    trackingId: string;
    events?: string[];
}
export interface UIErrorMonitoringConfig {
    provider: 'sentry' | 'rollbar' | 'bugsnag' | 'custom';
    dsn: string;
    environment?: string;
}
export interface UIPerformanceMonitoringConfig {
    provider: string;
    metrics: string[];
    sampling?: number;
}
export interface UIUptimeConfig {
    enabled: boolean;
    endpoints: string[];
    interval: number;
    alerts?: UIUptimeAlert[];
}
export interface UIUptimeAlert {
    threshold: number;
    window: number;
    channels: string[];
}
