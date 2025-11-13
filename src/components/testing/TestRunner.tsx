/**
 * Test Runner Component
 * UI for running patient data CRUD tests
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PatientDataTestSuite, TestResult } from '@/lib/testing/patientDataTests';
import { toast } from 'sonner';

interface TestRunnerProps {
  patientId: string;
}

export const TestRunner = ({ patientId }: TestRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      const testSuite = new PatientDataTestSuite();
      const testResults = await testSuite.runAllTests(patientId);
      const testSummary = testSuite.getSummary();

      setResults(testResults);
      setSummary(testSummary);

      if (testSummary.failed === 0) {
        toast.success(`All ${testSummary.passed} tests passed!`);
      } else {
        toast.error(`${testSummary.failed} test(s) failed`);
      }
    } catch (error) {
      toast.error('Test suite failed to run');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Patient Data Test Suite
          </CardTitle>
          <Button
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.totalTime}ms</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    {result.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">{result.testName}</div>
                      {result.error && (
                        <div className="text-sm text-destructive mt-1">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.passed ? 'default' : 'destructive'}>
                      {result.passed ? 'PASS' : 'FAIL'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.duration}ms
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {!isRunning && results.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Click "Run Tests" to start the test suite
          </div>
        )}
      </CardContent>
    </Card>
  );
};
