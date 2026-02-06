/**
 * Domain Layer: RDF Mapper
 *
 * Maps between domain entities (Task) and RDF triples.
 * This enables semantic representation of tasks as a knowledge graph.
 */

import { NamedNode, literal, graph, IndexedFormula, Statement, Literal } from 'rdflib';
import { Task } from './task';
import { Properties, Types, XSD } from './vocabularies';

export class RdfMapper {
  /**
   * Convert a Task entity to RDF triples
   */
  static taskToRdf(task: Task, _baseUri: string): Statement[] {
    const taskNode = new NamedNode(`urn:task:${task.id}`);
    const store = graph();

    // Type
    store.add(
      taskNode,
      new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      task.completed ? Types.CompletedTask : Types.PendingTask
    );

    // Properties
    store.add(taskNode, Properties.id, literal(task.id, XSD('string')) as Literal);
    store.add(taskNode, Properties.title, literal(task.title, XSD('string')) as Literal);
    store.add(taskNode, Properties.completed, literal(String(task.completed), XSD('boolean')) as Literal);
    store.add(taskNode, Properties.created, literal(task.created.toISOString(), XSD('dateTime')) as Literal);
    store.add(taskNode, Properties.modified, literal(task.modified.toISOString(), XSD('dateTime')) as Literal);

    if (task.completedAt) {
      store.add(taskNode, Properties.completedAt, literal(task.completedAt.toISOString(), XSD('dateTime')) as Literal);
    }

    return store.statements;
  }

  /**
   * Extract Task entities from an RDF store
   */
  static rdfToTasks(store: IndexedFormula, _baseUri: string): Task[] {
    const tasks: Task[] = [];

    // Find all task nodes
    const taskNodes = [
      ...store.each(undefined, new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), Types.CompletedTask),
      ...store.each(undefined, new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), Types.PendingTask),
    ];

    for (const taskNode of taskNodes) {
      if (taskNode.termType !== 'NamedNode') continue;

      try {
        const id = store.any(taskNode as any, Properties.id)?.value;
        const title = store.any(taskNode as any, Properties.title)?.value;
        const completed = store.any(taskNode as any, Properties.completed)?.value === 'true';
        const created = store.any(taskNode as any, Properties.created)?.value;
        const modified = store.any(taskNode as any, Properties.modified)?.value;
        const completedAt = store.any(taskNode as any, Properties.completedAt)?.value;

        if (!id || !title || !created || !modified) {
          continue;
        }

        const task: Task = {
          id,
          title,
          completed,
          created: new Date(created),
          modified: new Date(modified),
          completedAt: completedAt ? new Date(completedAt) : undefined,
        };

        tasks.push(task);
      } catch (error) {
        console.error('Error parsing task from RDF:', error);
      }
    }

    return tasks;
  }

  /**
   * Serialize an RDF store to Turtle format
   */
  static serializeToTurtle(store: IndexedFormula): string {
    return (store as any).toNT();
  }
}
