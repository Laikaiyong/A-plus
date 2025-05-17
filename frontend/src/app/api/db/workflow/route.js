export async function createStudyPlan(
  planData: StudyPlanData
): Promise<StudyPlanResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/create-study-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_name: planData.plan_name,
        plan_description: planData.plan_description,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create study plan");
    }

    return (await response.json()) as StudyPlanResponse;
  } catch (error) {
    console.error("Error creating study plan:", error);
    throw error;
  }
}

export async function triggerWorkflow(
    planId: number, 
    links: string[], 
    files: File[]
  ): Promise<WorkflowResponse> {
    try {
      const formData = new FormData();
      formData.append('plan_id', planId.toString());
      formData.append('links', JSON.stringify(links));
      
      // Append each file to the form data
      files.forEach(file => {
        formData.append('files', file);
      });
  
      const response = await fetch(`${API_BASE_URL}/trigger-workflow`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to trigger workflow');
      }
  
      return await response.json() as WorkflowResponse;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }
  