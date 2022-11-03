/* eslint-disable max-len */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';

import { getTodos } from './api';
import { Todo } from './types/Todo';

type Callback = (newQuery: string) => void;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoId, setTodoid] = useState(0);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [select, setSelect] = useState('all');

  function debaunce(f: Callback, delay: number) {
    let timerId: number;

    return (...args: []) => {
      clearTimeout(timerId);
      timerId = window.setTimeout(f, delay, ...args);
    };
  }

  const applyQuery = useCallback(
    debaunce(setAppliedQuery, 500), [],
  );

  useEffect(() => {
    getTodos().then(todoList => setTodos(todoList));
  }, []);

  const currentTodo = todos.find(todo => (todo.id === todoId));

  const closeModal = () => {
    setTodoid(0);
  };

  const onQueryChange = useCallback((changedQuery: string) => {
    setQuery(changedQuery);
  }, []);

  const onSelectChange = useCallback((changedSelect: string) => {
    setSelect(changedSelect);
  }, []);

  const getVisibleTodos = () => {
    const selectedBy = todos.filter(todo => {
      switch (select) {
        case 'active':
          return todo.completed === false;
        case 'completed':
          return todo.completed === true;
        default:
          return todo;
      }
    });

    return selectedBy.filter(todo => (
      todo.title.toLowerCase()
        .includes(appliedQuery.toLowerCase())
    ));
  };

  const visibleTodos = useMemo(
    getVisibleTodos,
    [todos, appliedQuery, select],
  );

  return (
    <>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                onQueryChange={onQueryChange}
                onSelectChange={onSelectChange}
                onApplyQuery={applyQuery}
                query={query}
                select={select}
              />
            </div>

            <div className="block">
              {todos.length === 0
                ? <Loader />
                : (
                  <TodoList
                    todos={visibleTodos}
                    selectedTodoId={todoId}
                    selectTodo={(id:number) => setTodoid(id)}
                  />
                )}
            </div>
          </div>
        </div>
      </div>

      {currentTodo && (
        <TodoModal
          currentTodo={currentTodo}
          onCloseModal={closeModal}
        />
      )}
    </>
  );
};
