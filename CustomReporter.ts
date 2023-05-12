import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class CustomReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    result.steps.forEach( (step, index) => {
        if(step.title.startsWith('报告移除-')) {
          result.steps.splice(index,1)
          console.log(step)
        }
      });
    // console.log(result.steps)
  }
}

export default CustomReporter;