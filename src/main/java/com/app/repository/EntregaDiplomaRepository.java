package com.app.repository;

import com.app.domain.EntregaDiploma;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the EntregaDiploma entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EntregaDiplomaRepository extends JpaRepository<EntregaDiploma, Long> {}
