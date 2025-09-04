
// src/ai/flows/suggest-shifts.ts
'use server';
/**
 * @fileOverview A flow to suggest relevant open shifts to an employee based on their profile.
 *
 * - suggestShifts - A function that suggests open shifts based on employee profile.
 * - SuggestShiftsInput - The input type for the suggestShifts function.
 * - SuggestShiftsOutput - The return type for the suggestShifts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestShiftsInputSchema = z.object({
  employeeProfile: z
    .string()
    .describe('Employee profile including skills, availability, associated locations, and preferences.'),
  openShifts: z.string().describe('List of open shifts from various locations.'),
});
export type SuggestShiftsInput = z.infer<typeof SuggestShiftsInputSchema>;

const SuggestedShiftSchema = z.object({
  shiftId: z.string().describe('The unique identifier of the shift.'),
  location: z.string().describe('The location offering the shift.'),
  role: z.string().describe('The role for the shift.'),
  date: z.string().describe('The date of the shift.'),
  startTime: z.string().describe('The start time of the shift.'),
  endTime: z.string().describe('The end time of the shift.'),
  hourlyRate: z.number().describe('The hourly rate for the shift.'),
  matchReason: z.string().describe('The reason why this shift is a good match for the employee.'),
});

const SuggestShiftsOutputSchema = z.array(SuggestedShiftSchema).describe('Array of suggested shifts, with reasons for each suggestion.');
export type SuggestShiftsOutput = z.infer<typeof SuggestShiftsOutputSchema>;

export async function suggestShifts(input: SuggestShiftsInput): Promise<SuggestShiftsOutput> {
  return suggestShiftsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShiftsPrompt',
  input: {schema: SuggestShiftsInputSchema},
  output: {schema: SuggestShiftsOutputSchema},
  prompt: `You are an AI assistant helping employees find relevant open shifts at Subway.

  Given an employee profile and a list of open shifts, your task is to suggest the most relevant shifts to the employee.
  Explain why each suggested shift is a good match for the employee based on their skills, availability, and preferences.
  Strongly prioritize shifts from locations the employee is associated with.

  Employee Profile:
  {{employeeProfile}}

  Open Shifts:
  {{openShifts}}

  Format your response as a JSON array of suggested shifts, including the shiftId, location, role, date, startTime, endTime, hourlyRate, and a matchReason for each shift.
  `,
});

const suggestShiftsFlow = ai.defineFlow(
  {
    name: 'suggestShiftsFlow',
    inputSchema: SuggestShiftsInputSchema,
    outputSchema: SuggestShiftsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
