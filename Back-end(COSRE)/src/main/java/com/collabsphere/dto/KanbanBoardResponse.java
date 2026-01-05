package com.collabsphere.dto;

import com.collabsphere.entity.Task;

import java.util.List;

public class KanbanBoardResponse {
    private List<Task> todoTasks;
    private List<Task> doingTasks;
    private List<Task> doneTasks;
    private Long teamId;
    private String teamName;

    public KanbanBoardResponse() {}

    public KanbanBoardResponse(List<Task> todoTasks, List<Task> doingTasks, List<Task> doneTasks, Long teamId, String teamName) {
        this.todoTasks = todoTasks;
        this.doingTasks = doingTasks;
        this.doneTasks = doneTasks;
        this.teamId = teamId;
        this.teamName = teamName;
    }

    public List<Task> getTodoTasks() {
        return todoTasks;
    }

    public void setTodoTasks(List<Task> todoTasks) {
        this.todoTasks = todoTasks;
    }

    public List<Task> getDoingTasks() {
        return doingTasks;
    }

    public void setDoingTasks(List<Task> doingTasks) {
        this.doingTasks = doingTasks;
    }

    public List<Task> getDoneTasks() {
        return doneTasks;
    }

    public void setDoneTasks(List<Task> doneTasks) {
        this.doneTasks = doneTasks;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }
}