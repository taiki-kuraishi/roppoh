package handler

// fakeEnqueuer records every record handed to it, so tests can assert on
// what a handler produces without a real pipeline.Client.
type fakeEnqueuer[T any] struct {
	records []T
}

func (f *fakeEnqueuer[T]) Enqueue(record T) {
	f.records = append(f.records, record)
}
