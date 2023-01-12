# @mfdlabs/sentinels

This is Node.js package that provides circuit breaker and sentinel functionality.

# Examples

```typescript
import { ExecutionCircuitBreaker } from '@mfdlabs/sentinels';

const breaker = new ExecutionCircuitBreaker(
  'test',
  (ex) => true,
  () => 5000,
);

try {
  breaker.execute(() => {
    throw new Error('test');
  });
} catch (err) {
  console.log(err); // Error: test
}

try {
  breaker.execute(() => {
    throw new Error('test');
  });
} catch (err) {
  console.log(err); // [CircuitBreaker Error]: 'test' has been tripped for xxx seconds.
}

// It also works with async functions
try {
  await breaker.executeAsync(async () => {
    throw new Error('test');
  });
} catch (err) {
  console.log(err); // [CircuitBreaker Error]: 'test' has been tripped for xxx seconds.
}
```

# Exports

The package exports the following:

```typescript
/**
 * The jitter enum for the exponential backoff algorithm.
 */
export enum Jitter {
  /**
   * No jitter.
   */
  None = 0,
  /**
   * Full jitter.
   */
  Full = 1,
  /**
   * Equal jitter.
   */
  Equal = 2,
}

/**
 * Error thrown when the circuit breaker is tripped.
 */
export class CircuitBreakerError extends Error {
  /**
   * Construct a new instance of the CircuitBreakerError class.
   * @param {string} message The error message.
   */
  constructor(message: string);
}

/**
 * Base class for circuit breakers.
 */
export abstract class CircuitBreakerBase implements ICircuitBreaker {
  /**
   * The name of the circuit breaker.
   */
  protected abstract get name(): string;

  /**
   * The date when the circuit breaker was tripped.
   * If the circuit breaker is not tripped, this value is undefined.
   */
  protected trippedAt: Date | undefined;

  /**
   * Gets the current date time.
   */
  protected get now(): Date;

  /**
   * Is the circuit breaker tripped?
   */
  get isTripped(): boolean;

  /**
   * Resets the circuit breaker.
   * @returns {boolean} True if the circuit breaker was reset, false otherwise.
   */
  reset(): boolean;

  /**
   * Tests the circuit breaker.
   * @throws {Error} If the circuit breaker is tripped.
   */
  test(): void;

  /**
   * Trips the circuit breaker.
   * @returns {boolean} True if the circuit breaker was tripped, false otherwise.
   */
  trip(): boolean;

  /**
   * Get the trip error.
   * @returns {Error} The trip error.
   */
  getTripError(): Error;
}

/**
 * Base class for circuit breaker policies.
 * @template TExecutionContext The type of the execution context.
 */
export abstract class CircuitBreakerPolicyBase<TExecutionContext> implements ICircuitBreakerPolicy<TExecutionContext> {
  /**
   * Construct a new instance of the CircuitBreakerPolicyBase class.
   * @param {ITripReasonAuthority<TExecutionContext>} tripReasonAuthority The trip reason authority.
   */
  protected constructor(tripReasonAuthority: ITripReasonAuthority<TExecutionContext>);

  /**
   * An action to perform when the circuit breaker is terminating a request.
   */
  onTerminatingRequest: OnTerminatingRequest | undefined;

  /**
   * An action to perform when a request to open the circuit breaker is made.
   */
  onRequestToOpen: OnRequestToOpen | undefined;

  /**
   * Notify the policy that a request has finished.
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error} error The error that occurred.
   */
  notifyRequestFinished(executionContext: TExecutionContext, error: Error): void;

  /**
   * Throw if the circuit breaker is tripped.
   * @param {TExecutionContext} executionContext The execution context.
   */
  throwIfTripped(executionContext: TExecutionContext): void;

  /**
   * Determine if the circuit breaker is openened.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {[boolean, Error]} A tuple containing a boolean indicating if the circuit breaker is openened and the error that caused the circuit breaker to open.
   */
  protected abstract isCircuitBreakerOpen(executionContext: TExecutionContext): [boolean, Error];

  /**
   * Try to trip the circuit breaker.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {boolean} True if the circuit breaker was tripped, otherwise false.
   */
  protected abstract tryToTripCircuitBreaker(executionContext: TExecutionContext): boolean;

  /**
   * An action to perform when a request has finished successfully.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {void}
   */
  protected abstract onSuccessfulRequest(executionContext: TExecutionContext): void;

  /**
   * An action to perform when the policy is notified.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {void}
   */
  protected abstract onNotified(executionContext: TExecutionContext): void;
}

/**
 * Represents a function that can be executed by an execution circuit breaker.
 */
export type Action = () => void;

/**
 * Represents a function that can be executed by an execution circuit breaker asynchronously.
 * @returns {Promise<void>} A promise that resolves when the function has completed.
 */
export type AsyncAction = () => Promise<void>;

/**
 * Base class for execution circuit breakers.
 */
export abstract class ExecutionCircuitBreakerBase extends CircuitBreakerBase {
  /**
   * The retry interval for the circuit breaker.
   */
  protected abstract get retryInterval(): number;

  /**
   * Should this circuit breaker trip?
   * @param {Error} error The error that was thrown.
   * @returns {boolean} True if the circuit breaker should trip, false otherwise.
   */
  protected abstract shouldTrip(error: Error): boolean;

  /**
   * Execute the given circuit action.
   * @param {Action} action The action to execute.
   */
  execute(action: Action): void;

  /**
   * Execute the given circuit action asynchronously.
   * @param {AsyncAction} action The action to execute.
   * @returns {Promise<void>} A promise that resolves when the action is executed.
   */
  executeAsync(action: AsyncAction): Promise<void>;

  /**
   * Reset the circuit breaker.
   * @returns {boolean} True if the circuit breaker was reset, false otherwise.
   */
  reset(): boolean;
}

/**
 * Base class for trip reason authorities.
 * @template TExecutionContext The type of the execution context.
 */
export abstract class TripReasonAuthorityBase<TExecutionContext> implements ITripReasonAuthority<TExecutionContext> {
  /**
   * Is a reason for tripping the circuit breaker.
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error} error The error that occurred.
   * @returns {boolean} True if the error is a reason for tripping the circuit breaker, otherwise false.
   */
  abstract isReasonForTrip(executionContext: TExecutionContext, error: Error): boolean;
}

/**
 * Simple circuit breaker. Provides an implementation for the name property.
 */
export class CircuitBreaker extends CircuitBreakerBase {
  /**
   * Construct a new instance of the CircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   */
  constructor(name: string);

  /**
   * The name of the circuit breaker.
   * @returns {string} The name of the circuit breaker.
   * @override
   */
  protected get name(): string;
}

/**
 * Represents a function to determine if an error is a failure.
 * @param {Error} error The error to check.
 * @returns {boolean} True if the error is a failure, otherwise false.
 */
export type FailureDetector = (error: Error) => boolean;

/**
 * Represents a function to calculate the retry interval.
 * @returns {number} The retry interval.
 */
export type RetryIntervalCalculator = () => number;

/**
 * Simple execution circuit breaker.
 */
export class ExecutionCircuitBreaker extends ExecutionCircuitBreakerBase {
  /**
   * Construct a new instance of the ExecutionCircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   * @param {FailureDetector} failureDetector The function to determine if an error is a failure.
   * @param {RetryIntervalCalculator} retryIntervalCalculator The function to calculate the retry interval.
   */
  constructor(name: string, failureDetector: FailureDetector, retryIntervalCalculator: RetryIntervalCalculator);

  /**
   * The name of the circuit breaker.
   * @returns {string} The name of the circuit breaker.
   * @override
   */
  protected get name(): string;

  /**
   * The function to determine if this circuit breaker should be tripped.
   * @param {Error} error The error to check.
   * @returns {boolean} True if the circuit breaker should be tripped, otherwise false.
   * @override
   */
  protected shouldTrip(error: Error): boolean;

  /**
   * Get the retry interval.
   * @returns {number} The retry interval.
   * @override
   */
  protected get retryInterval(): number;
}

/**
 * Represents a function to get the error count for tripping the circuit breaker.
 * @returns {number} The error count for tripping the circuit breaker.
 */
export type ErrorCountGetter = () => number;

/**
 * Represents a function to get the error interval for tripping the circuit breaker.
 * @returns {number} The error interval for tripping the circuit breaker.
 * @remarks The error interval is the time window in which the error count is calculated.
 */
export type ErrorIntervalGetter = () => number;

/**
 * Execution circuit breaker with an error threshold.
 */
export class ThresholdExecutionCircuitBreaker extends ExecutionCircuitBreakerBase {
  /**
   * Construct a new instance of the ThresholdExecutionCircuitBreaker class.
   * @param {string} name The name of the circuit breaker.
   * @param {FailureDetector} failureDetector The function to determine if an error is a failure.
   * @param {RetryIntervalCalculator} retryIntervalCalculator The function to calculate the retry interval.
   * @param {ErrorCountGetter} errorCountGetter The function to get the error count for tripping the circuit breaker.
   * @param {ErrorIntervalGetter} errorIntervalGetter The function to get the error interval for tripping the circuit breaker.
   */
  constructor(
    name: string,
    failureDetector: FailureDetector,
    retryIntervalCalculator: RetryIntervalCalculator,
    errorCountGetter: ErrorCountGetter,
    errorIntervalGetter: ErrorIntervalGetter,
  );

  /**
   * The name of the circuit breaker.
   * @returns {string} The name of the circuit breaker.
   * @override
   */
  protected get name(): string;

  /**
   * Should the circuit breaker be tripped.
   * @param {Error} error The error.
   * @returns {boolean} True if the circuit breaker should be tripped, otherwise false.
   */
  protected shouldTrip(error: Error): boolean;

  /**
   * Get the retry interval.
   * @returns {number} The retry interval.
   * @override
   */
  protected get retryInterval(): number;
}

/**
 * Default circuit breaker policy.
 * @template TExecutionContext The type of the execution context.
 */
export class DefaultCircuitBreakerPolicy<TExecutionContext> extends CircuitBreakerPolicyBase<TExecutionContext> {
  /**
   * The circuit breaker policy configuration.
   */
  protected readonly config: IDefaultCircuitBreakerPolicyConfig;

  /**
   * Construct a new instance of the DefaultCircuitBreakerPolicy class.
   * @param {string} circuitBreakerIdentifier The identifier of the circuit breaker.
   * @param {IDefaultCircuitBreakerPolicyConfig} config The circuit breaker policy configuration.
   * @param {ITripReasonAuthority<TExecutionContext>} tripReasonAuthority The trip reason authority.
   */
  constructor(
    circuitBreakerIdentifier: string,
    config: IDefaultCircuitBreakerPolicyConfig,
    tripReasonAuthority: ITripReasonAuthority<TExecutionContext>,
  );

  /**
   * Is the circuit breaker open?
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {[boolean, Error]} A tuple containing a boolean indicating whether the circuit breaker is open and an error if the circuit breaker is open.
   * @override
   */
  protected isCircuitBreakerOpen(executionContext: TExecutionContext): [boolean, Error];

  /**
   * On successful reequst.
   * @param {TExecutionContext} executionContext The execution context.
   * @override
   */
  protected onSuccessfulRequest(executionContext: TExecutionContext): void;

  /**
   * On notified.
   * @param {TExecutionContext} executionContext The execution context.
   * @override
   */
  protected onNotified(executionContext: TExecutionContext): void;

  /**
   * Try to trip the circuit breaker.
   * @param {TExecutionContext} executionContext The execution context.
   * @returns {boolean} A boolean indicating whether the circuit breaker was tripped.
   * @override
   */
  protected tryToTripCircuitBreaker(executionContext: TExecutionContext): boolean;
}

/**
 * Configuration for the default circuit breaker policy.
 */
export class DefaultCircuitBreakerPolicyConfig implements IDefaultCircuitBreakerPolicyConfig {
  /**
   * Retry interval in milliseconds.
   * @returns {number} Retry interval in milliseconds.
   */
  get retryInterval(): number;

  /**
   * Retry interval in milliseconds.
   * @param {number} value Retry interval in milliseconds.
   */
  set retryInterval(value: number);

  /**
   * Failures allowed before trip.
   * @returns {number} Failures allowed before trip.
   */
  get failuresAllowedBeforeTrip(): number;

  /**
   * Failures allowed before trip.
   * @param {number} value Failures allowed before trip.
   * @throws {Error} Failures allowed before trip is out of range.
   */
  set failuresAllowedBeforeTrip(value: number);
}

/**
 * Represents a function to determine if the service is healthy.
 * @returns {boolean} True if the service is healthy, otherwise false.
 */
export type HealthCheck = () => boolean;

/**
 * Represents a function to get the monitor interval.
 * @returns {number} The monitor interval.
 */
export type MonitorIntervalGetter = () => number;

/**
 * Simple sentinel for a health check service.
 */
export class ServiceSentinel implements ISentinel {
  /**
   * The function to get the monitor interval.
   */
  protected readonly monitorIntervalGetter: MonitorIntervalGetter;

  /**
   * The timer that monitors the service.
   */
  protected monitorTimer: NodeJS.Timeout;

  /**
   * Construct a new instance of the ServiceSentinel class.
   * @param {HealthCheck} healthCheck The function to determine if the service is healthy.
   * @param {MonitorIntervalGetter} monitorIntervalGetter The function to get the monitor interval.
   * @param {boolean} isHealthy The initial health status.
   */
  constructor(healthCheck: HealthCheck, monitorIntervalGetter: MonitorIntervalGetter, isHealthy: boolean);

  /**
   * Monitor the service. Protected so that classes that use monitorTimer can put the argument in the callback.
   * @returns {void}
   */
  protected monitor(): void;

  /**
   * Get the health status of the service.
   * @returns {boolean} True if the service is healthy, otherwise false.
   */
  get isHealthy(): boolean;

  /**
   * Dispose the sentinel.
   * @param {boolean} disposing True if disposing, otherwise false.
   */
  dispose(disposing: boolean): void;
}

/**
 * Service sentinel that can be toggled.
 */
export class TogglableServiceSentinel extends ServiceSentinel {
  /**
   * Construct a new instance of the TogglableServiceSentinel class.
   * @param {HealthCheck} healthCheck The function to determine if the service is healthy.
   * @param {MonitorIntervalGetter} monitorIntervalGetter The function to get the monitor interval.
   * @param {boolean} isHealthy The initial health status.
   */
  constructor(healthCheck: HealthCheck, monitorIntervalGetter: MonitorIntervalGetter, isHealthy: boolean);

  /**
   * Start the sentinel.
   * @returns {void}
   */
  start(): void;

  /**
   * Stop the sentinel.
   * @returns {void}
   */
  stop(): void;
}

/**
 * A class that calculates the exponential backoff time.
 */
export class ExponentialBackoff {
  /**
   * The ceiling for the maximum number of attempts.
   */
  static readonly ceilingForMaxAttempts = 10;

  /**
   * Calculates the exponential backoff time.
   * @param {number} attempt The attempt number.
   * @param {number} maxAttempts The maximum number of attempts.
   * @param {number} baseDelay The base delay.
   * @param {number} maxDelay The maximum delay.
   * @param {Jitter} jitter The jitter.
   * @returns {number} The exponential backoff time.
   * @throws {Error} The max attempts must be between 0 and 10.
   */
  static calculateBackoff(
    attempt: number,
    maxAttempts: number,
    baseDelay: number,
    maxDelay: number,
    jitter: Jitter,
  ): number;
}

/**
 * Interface for the sentinel.
 */
export interface ISentinel {
  /**
   * Is the sentinel healthy.
   * @returns {boolean} Is the sentinel healthy.
   */
  get isHealthy(): boolean;
}

/**
 * Interface for the circuit breaker.
 */
export interface ICircuitBreaker {
  /**
   * Is the circuit breaker tripped.
   * @returns {boolean} Is the circuit breaker tripped.
   */
  get isTripped(): boolean;

  /**
   * Reset the circuit breaker.
   * @returns {boolean} Is the circuit breaker tripped.
   */
  reset(): boolean;

  /**
   * Test the circuit breaker.
   * @returns {void}
   * @throws {CircuitBreakerError} Circuit breaker is tripped.
   */
  test(): void;

  /**
   * Trip the circuit breaker.
   * @returns {boolean} Is the circuit breaker tripped.
   */
  trip(): boolean;
}

/**
 * Interface for the trip reason authority.
 * @template TExecutionContext The execution context type.
 */
export interface ITripReasonAuthority<in TExecutionContext> {
  /**
   * Is this a reason to trip the circuit breaker?
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error} error The error.
   * @returns {boolean} Is this a reason to trip the circuit breaker?
   */
  isReasonForTrip(executionContext: TExecutionContext, error: Error): boolean;
}

/**
 * Function that is called when the circuit breaker is terminating a request.
 */
export type OnTerminatingRequest = () => void;

/**
 * Function that is called when a request to open the circuit breaker is made.
 */
export type OnRequestToOpen = () => void;

/**
 * Interface for the circuit breaker policy.
 * @template TExecutionContext The execution context type.
 */
export interface ICircuitBreakerPolicy<in TExecutionContext> {
  /**
   * Invoked when the circuit breaker terminates the request.
   */
  onTerminatingRequest: OnTerminatingRequest | undefined;

  /**
   * Invoked when a request to open the circuit breaker is made.
   */
  onRequestToOpen: OnRequestToOpen | undefined;

  /**
   * Notify the policy that a request has finished.
   * @param {TExecutionContext} executionContext The execution context.
   * @param {Error?} error The error that occurred.
   */
  notifyRequestFinished(executionContext: TExecutionContext, error?: Error): void;

  /**
   * Throw if the circuit breaker is tripped.
   * @param {TExecutionContext} executionContext The execution context.
   * @throws {CircuitBreakerError} Thrown if the circuit breaker is tripped.
   * @returns {void}
   */
  throwIfTripped(executionContext: TExecutionContext): void;
}

/**
 * Interface for the circuit breaker policy config.
 */
export interface IDefaultCircuitBreakerPolicyConfig {
  /**
   * The retry interval.
   * @returns {number} The retry interval.
   */
  get retryInterval(): number;

  /**
   * The retry interval.
   * @param {number} value The retry interval.
   */
  set retryInterval(value: number);

  /**
   * The failures allowed before tripping the circuit breaker.
   * @returns {number} The failures allowed before tripping the circuit breaker.
   */
  get failuresAllowedBeforeTrip(): number;

  /**
   * The failures allowed before tripping the circuit breaker.
   * @param {number} value The failures allowed before tripping the circuit breaker.
   */
  set failuresAllowedBeforeTrip(value: number);
}
```
