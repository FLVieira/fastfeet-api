import Bee from 'bee-queue';

import redisConfig from '../config/redis';
import NewOrderMail from '../app/jobs/NewOrderMail';

const jobs = [NewOrderMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    // Initializing the queues
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    // Adding new items into the queues
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    // Processing the items inside the queues
    jobs.forEach((job) => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
